const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { generateBookingReference, calculateRentalDays, calculateRentalCost } = require('../utils/helpers');

/**
 * POST /api/bookings
 * Create a new booking with proper availability check and pricing integrity
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed: ' + errors.array().map((e) => e.msg).join(', '), 400, errors.array());
    }

    const {
      vehicle_id,
      pickup_branch_id,
      return_branch_id,
      pickup_datetime,
      return_datetime,
      notes,
      discount = 0,
      additional_charges = 0,
    } = req.body;

    // Get customer_id for the logged-in user
    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (customers.length === 0) {
      return error(res, 'Customer profile not found. Please complete your registration profile.', 404);
    }
    const customer_id = customers[0].id;

    // Validate dates
    const pickupDate = new Date(pickup_datetime);
    const returnDate = new Date(return_datetime);

    if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
      return error(res, 'Invalid date format for pickup or return datetime.', 400);
    }

    if (pickupDate >= returnDate) {
      return error(res, 'Return datetime must be after pickup datetime.', 400);
    }

    // Fetch vehicle
    const [vehicles] = await pool.query(
      'SELECT id, name, brand, model, daily_rate, status, branch_id FROM vehicles WHERE id = ?',
      [vehicle_id]
    );
    if (vehicles.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    const vehicle = vehicles[0];

    if (vehicle.status === 'Inactive' || vehicle.status === 'Maintenance') {
      return error(res, `This vehicle is currently ${vehicle.status.toLowerCase()} and cannot be booked.`, 400);
    }

    // Check for overlapping bookings
    const [overlapping] = await pool.query(
      `SELECT id FROM bookings
       WHERE vehicle_id = ?
         AND status NOT IN ('Cancelled')
         AND NOT (return_datetime <= ? OR pickup_datetime >= ?)`,
      [vehicle_id, pickup_datetime, return_datetime]
    );

    if (overlapping.length > 0) {
      return error(
        res,
        'Vehicle is not available for the selected dates. Please choose different dates or another vehicle.',
        409
      );
    }

    // Security: Disallow arbitrary client discounts for standard customers
    const userRole = (req.user?.role || '').toLowerCase();
    const isStaff = ['admin', 'manager', 'agent'].includes(userRole);
    const appliedDiscount = isStaff ? (parseFloat(discount) || 0) : 0;
    const appliedAdditional = parseFloat(additional_charges) || 0;

    // Calculate cost
    const days = calculateRentalDays(pickup_datetime, return_datetime);
    const costBreakdown = calculateRentalCost(days, vehicle.daily_rate, appliedDiscount, appliedAdditional);
    const bookingReference = generateBookingReference();

    const actualPickupBranch = pickup_branch_id || vehicle.branch_id;
    const actualReturnBranch = return_branch_id || vehicle.branch_id;

    // Create booking adhering strictly to schema.sql
    const [result] = await pool.query(
      `INSERT INTO bookings
        (booking_reference, customer_id, vehicle_id, pickup_branch_id, return_branch_id,
         pickup_datetime, return_datetime, status, total_days, subtotal,
         discount, additional_charges, total_amount, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        bookingReference,
        customer_id,
        vehicle_id,
        actualPickupBranch,
        actualReturnBranch,
        pickup_datetime,
        return_datetime,
        days,
        costBreakdown.subtotal,
        appliedDiscount,
        appliedAdditional,
        costBreakdown.total,
        notes || null,
      ]
    );

    const [newBooking] = await pool.query(
      `SELECT bk.*,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              pb.name AS pickup_branch_name, pb.city AS pickup_city,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE bk.id = ?`,
      [result.insertId]
    );

    // Notify staff
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT u.id, 'New Booking Created', ?, 'Booking', NOW()
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE r.name IN ('Admin', 'Manager')`,
      [`New booking ${bookingReference} created for ${vehicle.name}.`]
    ).catch(() => {});

    return success(res, newBooking[0], 'Booking created successfully.', 201);
  } catch (err) {
    console.error('Booking create error:', err);
    return error(res, 'Failed to create booking: ' + err.message, 500);
  }
};

/**
 * GET /api/bookings (admin)
 */
const getAll = async (req, res) => {
  try {
    const {
      status,
      customer_id,
      vehicle_id,
      branch_id,
      from_date,
      to_date,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (status) { conditions.push('bk.status = ?'); params.push(status); }
    if (customer_id) { conditions.push('bk.customer_id = ?'); params.push(customer_id); }
    if (vehicle_id) { conditions.push('bk.vehicle_id = ?'); params.push(vehicle_id); }
    if (branch_id) {
      conditions.push('(bk.pickup_branch_id = ? OR bk.return_branch_id = ?)');
      params.push(branch_id, branch_id);
    }
    if (from_date) { conditions.push('DATE(bk.pickup_datetime) >= ?'); params.push(from_date); }
    if (to_date) { conditions.push('DATE(bk.pickup_datetime) <= ?'); params.push(to_date); }
    if (search) {
      conditions.push(
        "(bk.booking_reference LIKE ? OR CONCAT(c.first_name, ' ', c.last_name) LIKE ? OR v.name LIKE ? OR v.vehicle_id LIKE ?)"
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [bookings] = await pool.query(
      `SELECT bk.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, pb.city AS pickup_city,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       ${whereClause}
       ORDER BY bk.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, bookings, total, page, limit);
  } catch (err) {
    console.error('Booking getAll error:', err);
    return error(res, 'Failed to fetch bookings: ' + err.message, 500);
  }
};

/**
 * GET /api/bookings/:id
 */
const getById = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT bk.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone,
              c.driving_license AS license_number, c.address AS customer_address,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id,
              v.daily_rate AS vehicle_daily_rate, v.fuel_type, v.transmission,
              v.color, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, pb.city AS pickup_city, pb.address AS pickup_address,
              rb.name AS return_branch_name, rb.city AS return_city, rb.address AS return_address,
              inv.id AS invoice_id, inv.payment_status AS invoice_payment_status
       FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       LEFT JOIN invoices inv ON inv.booking_id = bk.id
       WHERE bk.id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];
    const userRole = (req.user?.role || '').toLowerCase();

    // Secure Authorization: customers can only view their own booking
    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== booking.customer_id) {
        return error(res, 'Access denied. You can only view your own bookings.', 403);
      }
    }

    return success(res, booking);
  } catch (err) {
    console.error('Booking getById error:', err);
    return error(res, 'Failed to fetch booking: ' + err.message, 500);
  }
};

/**
 * PUT /api/bookings/:id/confirm (admin/manager/agent)
 */
const confirm = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];

    if (booking.status !== 'Pending') {
      return error(res, `Booking cannot be confirmed. Current status: ${booking.status}`, 400);
    }

    await pool.query(
      "UPDATE bookings SET status = 'Confirmed', updated_at = NOW() WHERE id = ?",
      [bookingId]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT u.id, 'Booking Confirmed', ?, 'Booking', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your reservation ${booking.booking_reference} has been confirmed!`,
        booking.customer_id,
      ]
    ).catch(() => {});

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    return success(res, updated[0], 'Booking confirmed successfully.');
  } catch (err) {
    console.error('Booking confirm error:', err);
    return error(res, 'Failed to confirm booking: ' + err.message, 500);
  }
};

/**
 * PUT /api/bookings/:id/cancel
 */
const cancel = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    const booking = bookings[0];
    const userRole = (req.user?.role || '').toLowerCase();

    // Secure Authorization: Customers can only cancel their own bookings
    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== booking.customer_id) {
        return error(res, 'You can only cancel your own bookings.', 403);
      }
    }

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return error(res, `Booking cannot be cancelled. Current status is ${booking.status}.`, 400);
    }

    const reason = req.body.cancellation_reason || req.body.reason || 'Cancelled by customer';
    const updatedNotes = booking.notes
      ? `${booking.notes} [Cancelled: ${reason}]`
      : `[Cancelled: ${reason}]`;

    await pool.query(
      `UPDATE bookings SET
        status = 'Cancelled',
        notes = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [updatedNotes, bookingId]
    );

    // Free up vehicle if it was reserved
    await pool.query(
      "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ? AND status = 'Reserved'",
      [booking.vehicle_id]
    );

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    return success(res, updated[0], 'Booking cancelled successfully.');
  } catch (err) {
    console.error('Booking cancel error:', err);
    return error(res, 'Failed to cancel booking: ' + err.message, 500);
  }
};

/**
 * GET /api/bookings/my (customer)
 */
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }
    const customerId = customers[0].id;

    const conditions = ['bk.customer_id = ?'];
    const params = [customerId];

    if (status) { conditions.push('bk.status = ?'); params.push(status); }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings bk ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [bookings] = await pool.query(
      `SELECT bk.*,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, pb.city AS pickup_city,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       ${whereClause}
       ORDER BY bk.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, bookings, total, page, limit);
  } catch (err) {
    console.error('getMyBookings error:', err);
    return error(res, 'Failed to fetch your bookings: ' + err.message, 500);
  }
};

module.exports = { create, getAll, getById, confirm, cancel, getMyBookings };
