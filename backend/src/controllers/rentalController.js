const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { generateInvoiceNumber, calculateRentalDays, calculateRentalCost } = require('../utils/helpers');

/**
 * POST /api/rentals/start (admin/manager/agent)
 * Start a rental from a Confirmed booking
 */
const startRental = async (req, res) => {
  try {
    const booking_id = req.body.booking_id || req.body.bookingId;
    const { odometer_start = 0, condition_on_pickup = 'Good condition. Verified pre-rental checklist.' } = req.body;

    if (!booking_id) {
      return error(res, 'booking_id (or bookingId) is required.', 400);
    }

    // Fetch booking
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);

    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];

    if (!['Confirmed', 'Pending'].includes(booking.status)) {
      return error(res, `Cannot start rental. Current booking status is: ${booking.status}`, 400);
    }

    // Check if rental already started
    const [existingRental] = await pool.query('SELECT id FROM rentals WHERE booking_id = ?', [booking_id]);
    if (existingRental.length > 0) {
      return error(res, 'A rental record has already been started for this booking.', 409);
    }

    // Create rental record adhering strictly to schema.sql
    const [result] = await pool.query(
      `INSERT INTO rentals
        (booking_id, vehicle_id, customer_id, pickup_datetime, expected_return_datetime,
         status, odometer_start, condition_on_pickup, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), ?, 'Active', ?, ?, NOW(), NOW())`,
      [
        booking_id,
        booking.vehicle_id,
        booking.customer_id,
        booking.return_datetime,
        parseInt(odometer_start, 10) || 0,
        condition_on_pickup || null,
      ]
    );

    // Update booking status to Active
    await pool.query(
      "UPDATE bookings SET status = 'Active', updated_at = NOW() WHERE id = ?",
      [booking_id]
    );

    // Update vehicle status to Rented
    await pool.query(
      "UPDATE vehicles SET status = 'Rented', updated_at = NOW() WHERE id = ?",
      [booking.vehicle_id]
    );

    const [rental] = await pool.query(
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime AS booked_pickup, bk.return_datetime AS booked_return,
              bk.total_amount AS booking_total,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN users u ON u.id = c.user_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT u.id, 'Rental Handover Complete', ?, 'Rental', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your vehicle rental for ${rental[0].vehicle_name} has officially started. Safe travels!`,
        booking.customer_id,
      ]
    ).catch(() => {});

    return success(res, rental[0], 'Rental started successfully.', 201);
  } catch (err) {
    console.error('startRental error:', err);
    return error(res, 'Failed to start rental: ' + err.message, 500);
  }
};

/**
 * PUT /api/rentals/:id/complete (admin/manager/agent)
 * Complete a rental: calculate final cost, create invoice, update vehicle status
 */
const completeRental = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const {
      odometer_end,
      condition_on_return = 'Returned in good condition.',
      actual_return_datetime,
      additional_charges = 0,
    } = req.body;

    const [rentals] = await pool.query('SELECT * FROM rentals WHERE id = ?', [rentalId]);

    if (rentals.length === 0) {
      return error(res, 'Rental not found.', 404);
    }

    const rental = rentals[0];

    if (rental.status !== 'Active') {
      return error(res, `Cannot complete rental. Current status is: ${rental.status}`, 400);
    }

    // Fetch associated booking & vehicle
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [rental.booking_id]);
    const booking = bookings[0];

    const [vehicles] = await pool.query('SELECT daily_rate, name, brand, model FROM vehicles WHERE id = ?', [rental.vehicle_id]);
    const vehicle = vehicles[0];

    const actualReturn = actual_return_datetime ? new Date(actual_return_datetime) : new Date();
    const actualDays = calculateRentalDays(rental.pickup_datetime || booking.pickup_datetime, actualReturn);

    const extraCharges = parseFloat(additional_charges) || 0;
    const subtotal = actualDays * parseFloat(vehicle.daily_rate);
    const discount = parseFloat(booking.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount + extraCharges);
    const taxAmount = parseFloat((taxableAmount * 0.18).toFixed(2)); // 18% GST standard
    const finalTotal = parseFloat((taxableAmount + taxAmount).toFixed(2));

    const invoiceNumber = generateInvoiceNumber();
    const dueDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    // 1. Insert invoice adhering strictly to schema.sql
    const [invoiceResult] = await pool.query(
      `INSERT INTO invoices
        (invoice_number, booking_id, customer_id, subtotal, discount,
         additional_charges, tax_amount, total_amount, payment_status, issued_at, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), ?)`,
      [
        invoiceNumber,
        rental.booking_id,
        rental.customer_id,
        subtotal,
        discount,
        extraCharges,
        taxAmount,
        finalTotal,
        dueDate,
      ]
    );

    // 2. Update rental status
    const odoEnd = odometer_end ? parseInt(odometer_end, 10) : (rental.odometer_start + 120);
    await pool.query(
      `UPDATE rentals SET
        status = 'Completed',
        actual_return_datetime = ?,
        odometer_end = ?,
        condition_on_return = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        actualReturn,
        odoEnd,
        condition_on_return,
        rentalId,
      ]
    );

    // 3. Update booking status
    await pool.query(
      `UPDATE bookings SET
        status = 'Completed',
        actual_return_datetime = ?,
        total_amount = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [actualReturn, finalTotal, rental.booking_id]
    );

    // 4. Update vehicle status to Available
    await pool.query(
      "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ?",
      [rental.vehicle_id]
    );

    // 5. Insert audit log in rental_history adhering to schema.sql
    await pool.query(
      `INSERT INTO rental_history
        (booking_id, vehicle_id, customer_id, pickup_datetime, return_datetime,
         total_days, total_amount, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Completed', ?, NOW())`,
      [
        rental.booking_id,
        rental.vehicle_id,
        rental.customer_id,
        rental.pickup_datetime,
        actualReturn,
        actualDays,
        finalTotal,
        `Odometer: ${rental.odometer_start} -> ${odoEnd} km. ${condition_on_return}`,
      ]
    ).catch((e) => console.warn('Rental history audit error:', e.message));

    // 6. Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT u.id, 'Vehicle Return Processed', ?, 'Invoice', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your trip has ended. Invoice ${invoiceNumber} generated for ₹${finalTotal}. Thank you for choosing Vektor!`,
        rental.customer_id,
      ]
    ).catch(() => {});

    const [updatedRental] = await pool.query(
      `SELECT r.*, i.id AS invoice_id, i.invoice_number, i.total_amount AS invoice_total, i.payment_status
       FROM rentals r
       LEFT JOIN invoices i ON i.booking_id = r.booking_id
       WHERE r.id = ?`,
      [rentalId]
    );

    return success(res, {
      rental: updatedRental[0],
      invoice: {
        id: invoiceResult.insertId,
        invoice_number: invoiceNumber,
        total_amount: finalTotal,
        payment_status: 'Pending',
      },
      cost_breakdown: {
        actual_days: actualDays,
        subtotal,
        discount,
        additional_charges: extraCharges,
        tax_amount: taxAmount,
        total: finalTotal,
      },
    }, 'Rental completed and invoice generated successfully.');
  } catch (err) {
    console.error('completeRental error:', err);
    return error(res, 'Failed to complete rental: ' + err.message, 500);
  }
};

/**
 * GET /api/rentals/active
 */
const getActive = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS total FROM rentals WHERE status = 'Active'"
    );
    const total = countResult[0].total;

    const [rentals] = await pool.query(
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime AS booked_pickup, bk.return_datetime AS booked_return,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN users u ON u.id = c.user_id
       WHERE r.status = 'Active'
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit, 10), offset]
    );

    return paginated(res, rentals, total, page, limit);
  } catch (err) {
    console.error('getActive error:', err);
    return error(res, 'Failed to fetch active rentals: ' + err.message, 500);
  }
};

/**
 * GET /api/rentals/overdue
 */
const getOverdue = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.*, bk.booking_reference,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN users u ON u.id = c.user_id
       WHERE r.status = 'Active' AND r.expected_return_datetime < NOW()
       ORDER BY r.expected_return_datetime ASC`
    );

    return success(res, rentals);
  } catch (err) {
    console.error('getOverdue error:', err);
    return error(res, 'Failed to fetch overdue rentals: ' + err.message, 500);
  }
};

/**
 * GET /api/rentals/:id
 */
const getById = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime AS booked_pickup, bk.return_datetime AS booked_return,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone,
              i.id AS invoice_id, i.invoice_number, i.total_amount AS invoice_total, i.payment_status
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       JOIN users u ON u.id = c.user_id
       LEFT JOIN invoices i ON i.booking_id = r.booking_id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (rentals.length === 0) {
      return error(res, 'Rental record not found.', 404);
    }

    const rental = rentals[0];
    const userRole = (req.user?.role || '').toLowerCase();

    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== rental.customer_id) {
        return error(res, 'Access denied. You can only view your own rentals.', 403);
      }
    }

    return success(res, rental);
  } catch (err) {
    console.error('getById error:', err);
    return error(res, 'Failed to fetch rental: ' + err.message, 500);
  }
};

module.exports = { startRental, completeRental, getActive, getOverdue, getById };
