const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { generateInvoiceNumber, calculateRentalDays, calculateRentalCost } = require('../utils/helpers');

/**
 * POST /api/rentals/start (admin)
 * Start a rental from a Confirmed booking
 */
const startRental = async (req, res) => {
  try {
    const { booking_id, odometer_start, fuel_level_start = 'Full', notes } = req.body;

    if (!booking_id) {
      return error(res, 'booking_id is required.', 400);
    }

    // Fetch booking
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [booking_id]
    );

    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];

    if (booking.status !== 'Confirmed') {
      return error(res, `Cannot start rental. Booking status is: ${booking.status}`, 400);
    }

    // Check if rental already started
    const [existingRental] = await pool.query(
      'SELECT id FROM rentals WHERE booking_id = ?',
      [booking_id]
    );
    if (existingRental.length > 0) {
      return error(res, 'Rental has already been started for this booking.', 409);
    }

    // Create rental record
    const [result] = await pool.query(
      `INSERT INTO rentals
        (booking_id, vehicle_id, customer_id, expected_return_datetime,
         odometer_start, fuel_level_start, status, notes, started_by,
         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, ?, NOW(), NOW())`,
      [
        booking_id,
        booking.vehicle_id,
        booking.customer_id,
        booking.return_datetime,
        odometer_start || null,
        fuel_level_start,
        notes || null,
        req.user.id,
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
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              bk.total_amount AS booking_total,
              v.make, v.model, v.registration_number,
              c.name AS customer_name, c.email AS customer_email
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, created_at)
       SELECT u.id, 'Rental Started', ?, 'rental', ?, 'rental', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your rental for ${rental[0].make} ${rental[0].model} has started. Enjoy your trip!`,
        result.insertId,
        booking.customer_id,
      ]
    ).catch(() => {});

    return success(res, rental[0], 'Rental started successfully.', 201);
  } catch (err) {
    console.error('startRental error:', err);
    return error(res, 'Failed to start rental.', 500);
  }
};

/**
 * PUT /api/rentals/:id/complete (admin)
 * Complete a rental: calculate final cost, create invoice, update vehicle status
 */
const completeRental = async (req, res) => {
  try {
    const rentalId = req.params.id;
    const {
      odometer_end,
      fuel_level_end = 'Full',
      actual_return_datetime,
      additional_charges = 0,
      damage_charges = 0,
      notes,
    } = req.body;

    const [rentals] = await pool.query(
      'SELECT * FROM rentals WHERE id = ?',
      [rentalId]
    );

    if (rentals.length === 0) {
      return error(res, 'Rental not found.', 404);
    }

    const rental = rentals[0];

    if (rental.status !== 'Active') {
      return error(res, `Cannot complete rental. Current status: ${rental.status}`, 400);
    }

    // Fetch associated booking
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [rental.booking_id]);
    const booking = bookings[0];

    const actualReturn = actual_return_datetime
      ? new Date(actual_return_datetime)
      : new Date();

    const actualDays = calculateRentalDays(booking.pickup_datetime, actualReturn);
    const [vehicles] = await pool.query('SELECT daily_rate, branch_id FROM vehicles WHERE id = ?', [rental.vehicle_id]);
    const vehicle = vehicles[0];

    const totalAdditional =
      parseFloat(additional_charges) + parseFloat(damage_charges);
    const costBreakdown = calculateRentalCost(
      actualDays,
      vehicle.daily_rate,
      booking.discount,
      totalAdditional
    );

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber();

    const [invoiceResult] = await pool.query(
      `INSERT INTO invoices
        (invoice_number, rental_id, booking_id, customer_id, subtotal, discount,
         additional_charges, damage_charges, total_amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unpaid', NOW(), NOW())`,
      [
        invoiceNumber,
        rentalId,
        rental.booking_id,
        rental.customer_id,
        costBreakdown.subtotal,
        booking.discount,
        additional_charges,
        damage_charges,
        costBreakdown.total,
      ]
    );

    // Update rental
    await pool.query(
      `UPDATE rentals SET
        status = 'Completed',
        actual_return_datetime = ?,
        odometer_end = ?,
        fuel_level_end = ?,
        actual_days = ?,
        final_amount = ?,
        additional_charges = ?,
        damage_charges = ?,
        notes = COALESCE(?, notes),
        completed_by = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        actualReturn,
        odometer_end || null,
        fuel_level_end,
        actualDays,
        costBreakdown.total,
        additional_charges,
        damage_charges,
        notes || null,
        req.user.id,
        rentalId,
      ]
    );

    // Update booking status to Completed
    await pool.query(
      "UPDATE bookings SET status = 'Completed', updated_at = NOW() WHERE id = ?",
      [rental.booking_id]
    );

    // Update vehicle status to Available, return to branch
    await pool.query(
      "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ?",
      [rental.vehicle_id]
    );

    // Insert rental history record
    await pool.query(
      `INSERT INTO rental_history
        (rental_id, booking_id, vehicle_id, customer_id, pickup_datetime, actual_return_datetime,
         rental_days, total_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        rentalId,
        rental.booking_id,
        rental.vehicle_id,
        rental.customer_id,
        booking.pickup_datetime,
        actualReturn,
        actualDays,
        costBreakdown.total,
      ]
    ).catch(() => {}); // Non-critical

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, created_at)
       SELECT u.id, 'Rental Completed', ?, 'rental', ?, 'rental', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your rental has been completed. Invoice ${invoiceNumber} has been generated. Total: ₹${costBreakdown.total}`,
        rentalId,
        rental.customer_id,
      ]
    ).catch(() => {});

    const [updatedRental] = await pool.query(
      `SELECT r.*, i.invoice_number, i.total_amount AS invoice_total, i.id AS invoice_id
       FROM rentals r
       LEFT JOIN invoices i ON i.rental_id = r.id
       WHERE r.id = ?`,
      [rentalId]
    );

    return success(res, {
      rental: updatedRental[0],
      invoice: { id: invoiceResult.insertId, invoice_number: invoiceNumber, total: costBreakdown.total },
      cost_breakdown: costBreakdown,
    }, 'Rental completed successfully.');
  } catch (err) {
    console.error('completeRental error:', err);
    return error(res, 'Failed to complete rental.', 500);
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
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              v.make, v.model, v.registration_number, v.image_url,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       WHERE r.status = 'Active'
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit, 10), offset]
    );

    return paginated(res, rentals, total, page, limit);
  } catch (err) {
    console.error('getActive error:', err);
    return error(res, 'Failed to fetch active rentals.', 500);
  }
};

/**
 * GET /api/rentals/:id
 */
const getById = async (req, res) => {
  try {
    const [rentals] = await pool.query(
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              bk.total_amount AS booked_amount, bk.discount, bk.notes AS booking_notes,
              v.make, v.model, v.registration_number, v.daily_rate, v.fuel_type, v.image_url,
              vc.name AS category_name,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.license_number,
              pb.name AS pickup_branch_name, rb.name AS return_branch_name,
              i.invoice_number, i.total_amount AS invoice_total, i.status AS payment_status
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       JOIN customers c ON c.id = r.customer_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       LEFT JOIN invoices i ON i.rental_id = r.id
       WHERE r.id = ?`,
      [req.params.id]
    );

    if (rentals.length === 0) {
      return error(res, 'Rental not found.', 404);
    }

    return success(res, rentals[0]);
  } catch (err) {
    console.error('Rental getById error:', err);
    return error(res, 'Failed to fetch rental.', 500);
  }
};

/**
 * GET /api/rentals/overdue
 * Rentals past their expected return datetime
 */
const getOverdue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS total FROM rentals WHERE status = 'Active' AND expected_return_datetime < NOW()"
    );
    const total = countResult[0].total;

    const [rentals] = await pool.query(
      `SELECT r.*,
              TIMESTAMPDIFF(HOUR, r.expected_return_datetime, NOW()) AS hours_overdue,
              bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              v.make, v.model, v.registration_number,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       JOIN vehicles v ON v.id = r.vehicle_id
       JOIN customers c ON c.id = r.customer_id
       WHERE r.status = 'Active' AND r.expected_return_datetime < NOW()
       ORDER BY r.expected_return_datetime ASC
       LIMIT ? OFFSET ?`,
      [parseInt(limit, 10), offset]
    );

    return paginated(res, rentals, total, page, limit);
  } catch (err) {
    console.error('getOverdue error:', err);
    return error(res, 'Failed to fetch overdue rentals.', 500);
  }
};

module.exports = { startRental, completeRental, getActive, getById, getOverdue };
