const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { generateBookingReference, calculateRentalDays, calculateRentalCost } = require('../utils/helpers');

/**
 * POST /api/bookings
 * Create a new booking with proper availability check
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
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
      return error(res, 'Customer profile not found. Please complete your profile.', 404);
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

    if (pickupDate < new Date()) {
      return error(res, 'Pickup datetime cannot be in the past.', 400);
    }

    // Fetch vehicle
    const [vehicles] = await pool.query(
      'SELECT id, daily_rate, status FROM vehicles WHERE id = ?',
      [vehicle_id]
    );
    if (vehicles.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    const vehicle = vehicles[0];

    if (vehicle.status === 'Inactive') {
      return error(res, 'This vehicle is not available for booking.', 400);
    }

    // Check for overlapping bookings (the required SQL)
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
        'Vehicle is not available for the selected dates. Please choose different dates.',
        409
      );
    }

    // Calculate cost
    const days = calculateRentalDays(pickup_datetime, return_datetime);
    const costBreakdown = calculateRentalCost(days, vehicle.daily_rate, discount, additional_charges);
    const bookingReference = generateBookingReference();

    // Validate branches exist
    if (pickup_branch_id) {
      const [pb] = await pool.query('SELECT id FROM branches WHERE id = ?', [pickup_branch_id]);
      if (pb.length === 0) return error(res, 'Pickup branch not found.', 404);
    }
    if (return_branch_id) {
      const [rb] = await pool.query('SELECT id FROM branches WHERE id = ?', [return_branch_id]);
      if (rb.length === 0) return error(res, 'Return branch not found.', 404);
    }

    // Create booking
    const [result] = await pool.query(
      `INSERT INTO bookings
        (booking_reference, customer_id, vehicle_id, pickup_branch_id, return_branch_id,
         pickup_datetime, return_datetime, rental_days, daily_rate, subtotal,
         discount, additional_charges, total_amount, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, NOW(), NOW())`,
      [
        bookingReference,
        customer_id,
        vehicle_id,
        pickup_branch_id || null,
        return_branch_id || null,
        pickup_datetime,
        return_datetime,
        days,
        vehicle.daily_rate,
        costBreakdown.subtotal,
        costBreakdown.discount,
        costBreakdown.additionalCharges,
        costBreakdown.total,
        notes || null,
      ]
    );

    const [newBooking] = await pool.query(
      `SELECT bk.*, v.make, v.model, v.registration_number,
              pb.name AS pickup_branch_name, rb.name AS return_branch_name
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE bk.id = ?`,
      [result.insertId]
    );

    // Create notification for admin
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, created_at)
       SELECT u.id, 'New Booking Created', ?, 'booking', ?, 'booking', NOW()
       FROM users u WHERE u.role IN ('admin', 'staff')`,
      [
        `New booking ${bookingReference} created by customer.`,
        result.insertId,
      ]
    ).catch(() => {}); // Non-critical

    return success(res, newBooking[0], 'Booking created successfully.', 201);
  } catch (err) {
    console.error('Booking create error:', err);
    return error(res, 'Failed to create booking.', 500);
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
      conditions.push('(bk.booking_reference LIKE ? OR c.name LIKE ? OR v.make LIKE ? OR v.model LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [bookings] = await pool.query(
      `SELECT bk.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              v.make, v.model, v.registration_number, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, pb.city AS pickup_city,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
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
    return error(res, 'Failed to fetch bookings.', 500);
  }
};

/**
 * GET /api/bookings/:id
 */
const getById = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT bk.*, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.license_number, c.address AS customer_address,
              v.make, v.model, v.registration_number, v.daily_rate AS vehicle_daily_rate,
              v.fuel_type, v.transmission, v.color, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, pb.city AS pickup_city, pb.address AS pickup_address,
              rb.name AS return_branch_name, rb.city AS return_city, rb.address AS return_address
       FROM bookings bk
       LEFT JOIN customers c ON c.id = bk.customer_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE bk.id = ?`,
      [req.params.id]
    );

    if (bookings.length === 0) {
      return error(res, 'Booking not found.', 404);
    }

    // Check authorization: admin/staff can see all, customer can only see own
    const booking = bookings[0];
    if (req.user.role === 'customer') {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== booking.customer_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    return success(res, booking);
  } catch (err) {
    console.error('Booking getById error:', err);
    return error(res, 'Failed to fetch booking.', 500);
  }
};

/**
 * PUT /api/bookings/:id/confirm (admin)
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
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, created_at)
       SELECT u.id, 'Booking Confirmed', ?, 'booking', ?, 'booking', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Your booking ${booking.booking_reference} has been confirmed!`,
        bookingId,
        booking.customer_id,
      ]
    ).catch(() => {});

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    return success(res, updated[0], 'Booking confirmed successfully.');
  } catch (err) {
    console.error('Booking confirm error:', err);
    return error(res, 'Failed to confirm booking.', 500);
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

    // Customers can only cancel their own bookings
    if (req.user.role === 'customer') {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== booking.customer_id) {
        return error(res, 'You can only cancel your own bookings.', 403);
      }
    }

    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return error(res, `Booking cannot be cancelled. Current status: ${booking.status}`, 400);
    }

    const { cancellation_reason } = req.body;

    await pool.query(
      `UPDATE bookings SET
        status = 'Cancelled',
        cancellation_reason = ?,
        cancelled_at = NOW(),
        updated_at = NOW()
       WHERE id = ?`,
      [cancellation_reason || null, bookingId]
    );

    const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    return success(res, updated[0], 'Booking cancelled successfully.');
  } catch (err) {
    console.error('Booking cancel error:', err);
    return error(res, 'Failed to cancel booking.', 500);
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
      `SELECT bk.*, v.make, v.model, v.registration_number, v.image_url,
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
    return error(res, 'Failed to fetch your bookings.', 500);
  }
};

module.exports = { create, getAll, getById, confirm, cancel, getMyBookings };
