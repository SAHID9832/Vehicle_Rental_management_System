const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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
      conditions.push(
        "(CONCAT(c.first_name, ' ', c.last_name) LIKE ? OR u.email LIKE ? OR c.phone LIKE ? OR c.driving_license LIKE ? OR c.city LIKE ?)"
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [customers] = await pool.query(
      `SELECT c.*,
              CONCAT(c.first_name, ' ', c.last_name) AS name,
              c.driving_license AS license_number,
              u.email, r.name AS role, u.is_active, u.last_login,
              (SELECT COUNT(*) FROM bookings b WHERE b.customer_id = c.id) AS total_bookings
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN roles r ON r.id = u.role_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, customers, total, page, limit);
  } catch (err) {
    console.error('Customer getAll error:', err);
    return error(res, 'Failed to fetch customers: ' + err.message, 500);
  }
};

/**
 * GET /api/customers/:id
 * Admin: Get single customer with booking history
 */
const getById = async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT c.*,
              CONCAT(c.first_name, ' ', c.last_name) AS name,
              c.driving_license AS license_number,
              u.email, r.name AS role, u.is_active, u.last_login
       FROM customers c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (customers.length === 0) {
      return error(res, 'Customer not found.', 404);
    }

    const customer = customers[0];

    // Booking history
    const [bookings] = await pool.query(
      `SELECT bk.*,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
              vc.name AS category_name,
              pb.name AS pickup_branch_name, rb.name AS return_branch_name
       FROM bookings bk
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE bk.customer_id = ?
       ORDER BY bk.created_at DESC
       LIMIT 20`,
      [customer.id]
    );

    customer.booking_history = bookings;

    return success(res, customer);
  } catch (err) {
    console.error('Customer getById error:', err);
    return error(res, 'Failed to fetch customer: ' + err.message, 500);
  }
};

/**
 * POST /api/customers
 * Admin: Create a customer
 */
const create = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const {
      name,
      first_name,
      last_name,
      email,
      phone = '9876543210',
      address = 'City Hub',
      city = 'Bengaluru',
      state = 'Karnataka',
      pincode = '560001',
      driving_license,
      license_number,
      date_of_birth,
      password = 'Password@123',
    } = req.body;

    if (!email) {
      return error(res, 'Email address is required.', 400);
    }

    // Split name if first_name not passed separately
    let fName = first_name;
    let lName = last_name;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || parts[0];
    }
    fName = fName || 'Customer';
    lName = lName || 'User';

    const [existingUser] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return error(res, 'A user account with this email already exists.', 409);
    }

    await connection.beginTransaction();

    const [roleRows] = await connection.query('SELECT id FROM roles WHERE name = ?', ['Customer']);
    const roleId = roleRows.length > 0 ? roleRows[0].id : 4;

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userRes] = await connection.query(
      `INSERT INTO users (email, password_hash, role_id, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, NOW(), NOW())`,
      [email, hashedPassword, roleId]
    );

    const safeLicense = (driving_license || license_number || `DL-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`).trim();
    const safeDob = (date_of_birth || '1998-01-01').trim();

    const [custRes] = await connection.query(
      `INSERT INTO customers (user_id, first_name, last_name, phone, address, city, state, pincode, driving_license, date_of_birth, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userRes.insertId,
        fName,
        lName,
        phone,
        address,
        city,
        state,
        pincode,
        safeLicense,
        safeDob,
      ]
    );

    await connection.commit();

    const [newCustomer] = await pool.query(
      `SELECT c.*, CONCAT(c.first_name, ' ', c.last_name) AS name, u.email, r.name AS role
       FROM customers c
       JOIN users u ON u.id = c.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE c.id = ?`,
      [custRes.insertId]
    );

    return success(res, newCustomer[0], 'Customer created successfully.', 201);
  } catch (err) {
    await connection.rollback();
    console.error('Customer create error:', err);
    return error(res, 'Failed to create customer: ' + err.message, 500);
  } finally {
    connection.release();
  }
};

/**
 * PUT /api/customers/:id
 */
const update = async (req, res) => {
  try {
    const customerId = req.params.id;
    const userRole = (req.user?.role || '').toLowerCase();

    // Non-admins can only update own profile
    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE id = ? AND user_id = ?', [
        customerId,
        req.user.id,
      ]);
      if (own.length === 0) {
        return error(res, 'You can only update your own profile.', 403);
      }
    }

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (existing.length === 0) {
      return error(res, 'Customer not found.', 404);
    }

    const current = existing[0];
    const {
      name,
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      pincode,
      driving_license,
      license_number,
      date_of_birth,
    } = req.body;

    let fName = first_name;
    let lName = last_name;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || parts[0];
    }

    const finalLicense = driving_license || license_number || current.driving_license;

    await pool.query(
      `UPDATE customers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        driving_license = COALESCE(?, driving_license),
        date_of_birth = COALESCE(?, date_of_birth),
        updated_at = NOW()
       WHERE id = ?`,
      [
        fName || null,
        lName || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        finalLicense || null,
        date_of_birth || null,
        customerId,
      ]
    );

    const [updated] = await pool.query(
      `SELECT c.*, CONCAT(c.first_name, ' ', c.last_name) AS name, u.email, r.name AS role
       FROM customers c
       JOIN users u ON u.id = c.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE c.id = ?`,
      [customerId]
    );

    return success(res, updated[0], 'Customer updated successfully.');
  } catch (err) {
    console.error('Customer update error:', err);
    return error(res, 'Failed to update customer: ' + err.message, 500);
  }
};

/**
 * GET /api/customers/me/profile
 * Get own customer profile
 */
const getMyProfile = async (req, res) => {
  try {
    const [customers] = await pool.query(
      `SELECT c.*,
              CONCAT(c.first_name, ' ', c.last_name) AS name,
              c.driving_license AS license_number,
              u.email AS user_email, u.email, r.name AS role, u.last_login
       FROM customers c
       JOIN users u ON u.id = c.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }

    return success(res, customers[0]);
  } catch (err) {
    console.error('getMyProfile error:', err);
    return error(res, 'Failed to fetch profile: ' + err.message, 500);
  }
};

/**
 * PUT /api/customers/me/profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      first_name,
      last_name,
      phone,
      address,
      city,
      state,
      pincode,
      driving_license,
      license_number,
      date_of_birth,
    } = req.body;

    const [customers] = await pool.query('SELECT * FROM customers WHERE user_id = ?', [req.user.id]);

    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }

    const customerId = customers[0].id;
    let fName = first_name;
    let lName = last_name;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || parts[0];
    }

    const finalLicense = driving_license || license_number;

    await pool.query(
      `UPDATE customers SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        driving_license = COALESCE(?, driving_license),
        date_of_birth = COALESCE(?, date_of_birth),
        updated_at = NOW()
       WHERE id = ?`,
      [
        fName || null,
        lName || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        finalLicense || null,
        date_of_birth || null,
        customerId,
      ]
    );

    const [updated] = await pool.query(
      `SELECT c.*, CONCAT(c.first_name, ' ', c.last_name) AS name, u.email, r.name AS role
       FROM customers c
       JOIN users u ON u.id = c.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE c.id = ?`,
      [customerId]
    );

    return success(res, updated[0], 'Profile updated successfully.');
  } catch (err) {
    console.error('updateMyProfile error:', err);
    return error(res, 'Failed to update profile: ' + err.message, 500);
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
       WHERE bk.customer_id = ?
       ORDER BY bk.created_at DESC
       LIMIT ? OFFSET ?`,
      [customerId, parseInt(limit, 10), offset]
    );

    return paginated(res, bookings, total, page, limit);
  } catch (err) {
    console.error('getMyBookings error:', err);
    return error(res, 'Failed to fetch bookings: ' + err.message, 500);
  }
};

/**
 * GET /api/customers/me/history
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
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
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
    return error(res, 'Failed to fetch rental history: ' + err.message, 500);
  }
};

/**
 * DELETE /api/customers/:id
 * Admin: Delete customer and associated user account safely
 */
const remove = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const customerId = req.params.id;
    const [custRows] = await connection.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (custRows.length === 0) {
      return error(res, 'Customer not found.', 404);
    }
    const customer = custRows[0];

    // Check for active rentals or confirmed bookings
    const [activeBookings] = await connection.query(
      "SELECT id FROM bookings WHERE customer_id = ? AND status IN ('Pending', 'Confirmed', 'Active')",
      [customerId]
    );
    if (activeBookings.length > 0) {
      return error(res, 'Cannot delete customer with active or pending bookings. Cancel or complete them first.', 400);
    }

    await connection.beginTransaction();

    // Delete customer profile and underlying user account
    await connection.query('DELETE FROM customers WHERE id = ?', [customerId]);
    if (customer.user_id) {
      await connection.query('DELETE FROM users WHERE id = ?', [customer.user_id]);
    }

    await connection.commit();
    return success(res, null, 'Customer deleted successfully.');
  } catch (err) {
    await connection.rollback();
    console.error('Customer delete error:', err);
    return error(res, 'Failed to delete customer: ' + err.message, 500);
  } finally {
    connection.release();
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getMyProfile,
  updateMyProfile,
  getMyBookings,
  getMyRentalHistory,
};

