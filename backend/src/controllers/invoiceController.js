const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { formatCurrency } = require('../utils/helpers');

/**
 * GET /api/invoices (admin/manager/agent)
 */
const getAll = async (req, res) => {
  try {
    const { status, customer_id, from_date, to_date, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (status) { conditions.push('i.payment_status = ?'); params.push(status); }
    if (customer_id) { conditions.push('i.customer_id = ?'); params.push(customer_id); }
    if (from_date) { conditions.push('DATE(i.issued_at) >= ?'); params.push(from_date); }
    if (to_date) { conditions.push('DATE(i.issued_at) <= ?'); params.push(to_date); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM invoices i ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [invoices] = await pool.query(
      `SELECT i.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id,
              bk.booking_reference
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       ${whereClause}
       ORDER BY i.issued_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, invoices, total, page, limit);
  } catch (err) {
    console.error('Invoice getAll error:', err);
    return error(res, 'Failed to fetch invoices: ' + err.message, 500);
  }
};

/**
 * GET /api/invoices/:id
 */
const getById = async (req, res) => {
  try {
    const [invoices] = await pool.query(
      `SELECT i.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              u.email AS customer_email, c.phone AS customer_phone,
              c.address AS customer_address, c.driving_license AS license_number,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id,
              v.fuel_type, v.transmission, v.color, v.image_url,
              vc.name AS category_name,
              bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              bk.total_days AS booked_days,
              pb.name AS pickup_branch_name, pb.city AS pickup_city,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (invoices.length === 0) {
      return error(res, 'Invoice not found.', 404);
    }

    const invoice = invoices[0];
    const userRole = (req.user?.role || '').toLowerCase();

    // Secure Authorization: customer can only see their own invoice
    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== invoice.customer_id) {
        return error(res, 'Access denied. You can only view your own invoices.', 403);
      }
    }

    // Fetch payments
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_at DESC',
      [invoice.id]
    );

    invoice.payments = payments;

    return success(res, invoice);
  } catch (err) {
    console.error('Invoice getById error:', err);
    return error(res, 'Failed to fetch invoice: ' + err.message, 500);
  }
};

/**
 * GET /api/invoices/my
 * Customer's own invoices
 */
const getMyInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [customers] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (customers.length === 0) {
      return error(res, 'Customer profile not found.', 404);
    }
    const customerId = customers[0].id;

    const conditions = ['i.customer_id = ?'];
    const params = [customerId];

    if (status) { conditions.push('i.payment_status = ?'); params.push(status); }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM invoices i ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [invoices] = await pool.query(
      `SELECT i.*,
              bk.booking_reference,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id
       FROM invoices i
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN vehicles v ON v.id = bk.vehicle_id
       ${whereClause}
       ORDER BY i.issued_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, invoices, total, page, limit);
  } catch (err) {
    console.error('getMyInvoices error:', err);
    return error(res, 'Failed to fetch your invoices: ' + err.message, 500);
  }
};

/**
 * POST /api/invoices/:id/pay
 * Simulate payment: mark invoice as Paid, record in payments table
 */
const simulatePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { payment_method = 'Simulated' } = req.body;

    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);

    if (invoices.length === 0) {
      return error(res, 'Invoice not found.', 404);
    }

    const invoice = invoices[0];

    if (invoice.payment_status === 'Paid') {
      return error(res, 'Invoice is already paid.', 400);
    }

    const userRole = (req.user?.role || '').toLowerCase();
    if (!['admin', 'manager', 'agent'].includes(userRole)) {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== invoice.customer_id) {
        return error(res, 'Access denied. You can only pay your own invoices.', 403);
      }
    }

    const txnId = `SIM-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Map method to valid ENUM('Cash','Card','UPI','NetBanking','Simulated')
    let safeMethod = 'Simulated';
    if (['Cash', 'Card', 'UPI', 'NetBanking'].includes(payment_method)) {
      safeMethod = payment_method;
    }

    // Insert payment adhering strictly to schema.sql
    await pool.query(
      `INSERT INTO payments
        (invoice_id, amount, payment_method, transaction_id, status, paid_at, notes)
       VALUES (?, ?, ?, ?, 'Success', NOW(), 'Simulated academic demonstration payment')`,
      [invoiceId, invoice.total_amount, safeMethod, txnId]
    );

    // Update invoice payment_status
    await pool.query(
      "UPDATE invoices SET payment_status = 'Paid', paid_at = NOW() WHERE id = ?",
      [invoiceId]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, created_at)
       SELECT u.id, 'Payment Received', ?, 'Payment', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Payment of ${formatCurrency(invoice.total_amount)} received for invoice ${invoice.invoice_number}. Txn: ${txnId}`,
        invoice.customer_id,
      ]
    ).catch(() => {});

    const [updated] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);

    return success(res, {
      invoice: updated[0],
      transaction_id: txnId,
      paid_amount: invoice.total_amount,
    }, 'Payment simulated and recorded successfully in database.');
  } catch (err) {
    console.error('simulatePayment error:', err);
    return error(res, 'Failed to process payment: ' + err.message, 500);
  }
};

/**
 * GET /api/invoices/:id/pdf
 */
const generatePDF = async (req, res) => {
  try {
    const [invoices] = await pool.query(
      `SELECT i.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              c.phone AS customer_phone, c.address AS customer_address,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id,
              bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              pb.name AS branch_name, pb.city AS branch_city, pb.address AS branch_address
       FROM invoices i
       JOIN customers c ON c.id = i.customer_id
       JOIN bookings bk ON bk.id = i.booking_id
       JOIN vehicles v ON v.id = bk.vehicle_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (invoices.length === 0) {
      return error(res, 'Invoice not found.', 404);
    }

    return success(res, invoices[0]);
  } catch (err) {
    console.error('generatePDF error:', err);
    return error(res, 'Failed to load PDF data: ' + err.message, 500);
  }
};

module.exports = { getAll, getById, getMyInvoices, simulatePayment, generatePDF };
