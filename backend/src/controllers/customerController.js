const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');

/**
 * GET /api/customers
 * Admin: Get all customers with search and pagination
 */
const getAll = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR c.license_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM customers c ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [customers] = await pool.query(
      `SELECT c.*, u.role, u.is_active, u.last_login,
              (SELECT COUNT(*) FROM bookings b WHERE b.customer_id = c.id) AS total_bookings
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, customers, total, page, limit);
  } catch (err) {
    console.error('Customer getAll error:', err);
    return error(res, 'Failed to fetch customers.', 500);
  }
};

/**
 * GET /api/customers/:id
 * Admin: Get single customer with booking history
 */
const getById = async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT c.*, u.role, u.is_active, u.last_login
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (customers.length === 0) {
      return error(res, 'Customer not found.', 404);
    }

    const customer = customers[0];

    // Booking history
    const [bookings] = await pool.query(
      `SELECT bk.*, v.make, v.model, v.registration_number, vc.name AS category_name
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       WHERE bk.customer_id = ?
       ORDER BY bk.created_at DESC
       LIMIT 20`,
      [customer.id]
    );

    customer.booking_history = bookings;

    return success(res, customer);
  } catch (err) {
    console.error('Customer getById error:', err);
    return error(res, 'Failed to fetch customer.', 500);
  }
};

/**
 * POST /api/customers
 * Admin: Create a customer
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { name, email, phone, address, license_number, date_of_birth } = req.body;

    const [existing] = await pool.query('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return error(res, 'A customer with this email already exists.', 409);
    }

    const [result] = await pool.query(
      `INSERT INTO customers (name, email, phone, address, license_number, date_of_birth, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, phone || null, address || null, license_number || null, date_of_birth || null]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    return success(res, newCustomer[0], 'Customer created successfully.', 201);
  } catch (err) {
    console.error('Customer create error:', err);
    return error(res, 'Failed to create customer.', 500);
  }
};

/**
 * PUT /api/customers/:id
 */
const update = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Non-admins can only update own profile
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      const [own] = await pool.query('SELECT id FROM customers WHERE id = ? AND user_id = ?', [
        customerId,
        req.user.id,
      ]);
      if (own.length === 0) {
        return error(res, 'You can only update your own profile.', 403);
      }
    }

    const [existing] = await pool.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (existing.length === 0) {
      return error(res, 'Customer not found.', 404);
    }

    const { name, phone, address, license_number, date_of_birth } = req.body;

    await pool.query(
      `UPDATE customers SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        license_number = COALESCE(?, license_number),
        date_of_birth = COALESCE(?, date_of_birth),
        updated_at = NOW()
       WHERE id = ?`,
      [name || null, phone || null, address || null, license_number || null, date_of_birth || null, customerId]
    );

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);

    return success(res, updated[0], 'Customer updated successfully.');
  } catch (err) {
    console.error('Customer update error:', err);
    return error(res, 'Failed to update customer.', 500);
  }
};

/**
 * GET /api/customers/me/profile
 * Get own customer profile
 */
const getMyProfile = async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT c.*, u.email AS user_email, u.role, u.last_login
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }

    return success(res, customers[0]);
  } catch (err) {
    console.error('getMyProfile error:', err);
    return error(res, 'Failed to fetch profile.', 500);
  }
};

/**
 * PUT /api/customers/me/profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, address, license_number, date_of_birth } = req.body;

    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);

    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }

    const customerId = customers[0].id;

    await pool.query(
      `UPDATE customers SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        license_number = COALESCE(?, license_number),
        date_of_birth = COALESCE(?, date_of_birth),
        updated_at = NOW()
       WHERE id = ?`,
      [name || null, phone || null, address || null, license_number || null, date_of_birth || null, customerId]
    );

    // Also update user name
    if (name) {
      await pool.query('UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?', [name, req.user.id]);
    }

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);

    return success(res, updated[0], 'Profile updated successfully.');
  } catch (err) {
    console.error('updateMyProfile error:', err);
    return error(res, 'Failed to update profile.', 500);
  }
};

/**
 * GET /api/customers/me/bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }
    const customerId = customers[0].id;

    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM bookings WHERE customer_id = ?',
      [customerId]
    );
    const total = countResult[0].total;

    const [bookings] = await pool.query(
      `SELECT bk.*, v.make, v.model, v.registration_number, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name,
              rb.name AS return_branch_name
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE bk.customer_id = ?
       ORDER BY bk.created_at DESC
       LIMIT ? OFFSET ?`,
      [customerId, parseInt(limit, 10), offset]
    );

    return paginated(res, bookings, total, page, limit);
  } catch (err) {
    console.error('getMyBookings error:', err);
    return error(res, 'Failed to fetch bookings.', 500);
  }
};

/**
 * GET /api/customers/me/history
 * Customer's rental history
 */
const getMyRentalHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }
    const customerId = customers[0].id;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       WHERE bk.customer_id = ?`,
      [customerId]
    );
    const total = countResult[0].total;

    const [history] = await pool.query(
      `SELECT r.*, bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              v.make, v.model, v.registration_number, v.image_url,
              vc.name AS category_name,
              i.invoice_number, i.total_amount, i.payment_status AS invoice_status
       FROM rentals r
       JOIN bookings bk ON bk.id = r.booking_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN invoices i ON i.booking_id = bk.id
       WHERE bk.customer_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [customerId, parseInt(limit, 10), offset]
    );

    return paginated(res, history, total, page, limit);
  } catch (err) {
    console.error('getMyRentalHistory error:', err);
    return error(res, 'Failed to fetch rental history.', 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  getMyProfile,
  updateMyProfile,
  getMyBookings,
  getMyRentalHistory,
};
