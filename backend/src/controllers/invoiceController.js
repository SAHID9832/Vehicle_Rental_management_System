const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { formatCurrency } = require('../utils/helpers');

/**
 * GET /api/invoices (admin)
 */
const getAll = async (req, res) => {
  try {
    const { status, customer_id, from_date, to_date, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (status) { conditions.push('i.status = ?'); params.push(status); }
    if (customer_id) { conditions.push('i.customer_id = ?'); params.push(customer_id); }
    if (from_date) { conditions.push('DATE(i.created_at) >= ?'); params.push(from_date); }
    if (to_date) { conditions.push('DATE(i.created_at) <= ?'); params.push(to_date); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM invoices i ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [invoices] = await pool.query(
      `SELECT i.*,
              c.name AS customer_name, c.email AS customer_email,
              v.make, v.model, v.registration_number,
              bk.booking_reference
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN rentals r ON r.id = i.rental_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, invoices, total, page, limit);
  } catch (err) {
    console.error('Invoice getAll error:', err);
    return error(res, 'Failed to fetch invoices.', 500);
  }
};

/**
 * GET /api/invoices/:id
 */
const getById = async (req, res) => {
  try {
    const [invoices] = await pool.query(
      `SELECT i.*,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address AS customer_address, c.license_number,
              v.make, v.model, v.registration_number, v.fuel_type, v.transmission,
              vc.name AS category_name,
              bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              bk.rental_days AS booked_days,
              r.actual_days, r.actual_return_datetime, r.odometer_start, r.odometer_end,
              r.fuel_level_start, r.fuel_level_end,
              pb.name AS pickup_branch_name, pb.city AS pickup_city, pb.address AS pickup_address,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN rentals r ON r.id = i.rental_id
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
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

    // Authorization: customer can only see own invoice
    if (req.user.role === 'customer') {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== invoice.customer_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    // Fetch payment details if paid
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at DESC',
      [invoice.id]
    );

    invoice.payments = payments;

    return success(res, invoice);
  } catch (err) {
    console.error('Invoice getById error:', err);
    return error(res, 'Failed to fetch invoice.', 500);
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

    if (status) { conditions.push('i.status = ?'); params.push(status); }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM invoices i ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [invoices] = await pool.query(
      `SELECT i.*, bk.booking_reference, v.make, v.model
       FROM invoices i
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN rentals r ON r.id = i.rental_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, invoices, total, page, limit);
  } catch (err) {
    console.error('getMyInvoices error:', err);
    return error(res, 'Failed to fetch your invoices.', 500);
  }
};

/**
 * POST /api/invoices/:id/pay
 * Simulate payment: mark invoice as Paid, create payment record
 */
const simulatePayment = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { payment_method = 'Card', transaction_reference } = req.body;

    const [invoices] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);

    if (invoices.length === 0) {
      return error(res, 'Invoice not found.', 404);
    }

    const invoice = invoices[0];

    if (invoice.status === 'Paid') {
      return error(res, 'Invoice is already paid.', 400);
    }

    if (invoice.status === 'Cancelled') {
      return error(res, 'Cannot pay a cancelled invoice.', 400);
    }

    // Authorization check
    if (req.user.role === 'customer') {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== invoice.customer_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    // Simulate payment — CLEARLY SIMULATED (no real payment gateway)
    const simulatedTransactionRef =
      transaction_reference || `SIM-TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create payment record
    await pool.query(
      `INSERT INTO payments
        (invoice_id, amount, payment_method, transaction_reference, status,
         is_simulated, paid_at, created_at)
       VALUES (?, ?, ?, ?, 'Success', 1, NOW(), NOW())`,
      [invoiceId, invoice.total_amount, payment_method, simulatedTransactionRef]
    );

    // Update invoice status to Paid
    await pool.query(
      "UPDATE invoices SET status = 'Paid', paid_at = NOW(), updated_at = NOW() WHERE id = ?",
      [invoiceId]
    );

    // Notify customer
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type, created_at)
       SELECT u.id, 'Payment Successful', ?, 'payment', ?, 'invoice', NOW()
       FROM customers c JOIN users u ON u.id = c.user_id WHERE c.id = ?`,
      [
        `Payment of ${formatCurrency(invoice.total_amount)} received for invoice ${invoice.invoice_number}. Transaction: ${simulatedTransactionRef}`,
        invoiceId,
        invoice.customer_id,
      ]
    ).catch(() => {});

    return success(res, {
      invoice_id: invoiceId,
      invoice_number: invoice.invoice_number,
      amount_paid: invoice.total_amount,
      payment_method,
      transaction_reference: simulatedTransactionRef,
      status: 'Paid',
      note: 'This is a SIMULATED payment. No real transaction occurred.',
    }, 'Payment simulated successfully. Invoice marked as paid.');
  } catch (err) {
    console.error('simulatePayment error:', err);
    return error(res, 'Failed to process payment.', 500);
  }
};

/**
 * GET /api/invoices/:id/pdf
 * Return invoice data formatted for PDF generation on frontend
 */
const generatePDF = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    const [invoices] = await pool.query(
      `SELECT i.*,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              c.address AS customer_address, c.license_number,
              v.make, v.model, v.year, v.registration_number, v.fuel_type, v.transmission,
              v.color, v.seating_capacity,
              vc.name AS category_name,
              bk.booking_reference, bk.pickup_datetime, bk.return_datetime,
              bk.rental_days AS booked_days,
              r.actual_days, r.actual_return_datetime,
              pb.name AS pickup_branch_name, pb.city AS pickup_city, pb.address AS pickup_address,
              pb.phone AS pickup_branch_phone,
              rb.name AS return_branch_name, rb.city AS return_city
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       LEFT JOIN rentals r ON r.id = i.rental_id
       LEFT JOIN bookings bk ON bk.id = i.booking_id
       LEFT JOIN vehicles v ON v.id = r.vehicle_id
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
       LEFT JOIN branches rb ON rb.id = bk.return_branch_id
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (invoices.length === 0) {
      return error(res, 'Invoice not found.', 404);
    }

    const invoice = invoices[0];

    // Authorization
    if (req.user.role === 'customer') {
      const [own] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
      if (own.length === 0 || own[0].id !== invoice.customer_id) {
        return error(res, 'Access denied.', 403);
      }
    }

    const pdfData = {
      company: {
        name: 'Vektor Rentals',
        tagline: 'Drive the Future',
        address: 'Vektor Rentals HQ, Mumbai, India',
        phone: '+91 98765 43210',
        email: 'support@vektorrentals.in',
        website: 'www.vektorrentals.in',
        gst: 'GST: 27ABCDE1234F1Z5',
      },
      invoice: {
        invoice_number: invoice.invoice_number,
        date: invoice.created_at,
        due_date: invoice.due_date || invoice.created_at,
        status: invoice.status,
        paid_at: invoice.paid_at,
      },
      customer: {
        name: invoice.customer_name,
        email: invoice.customer_email,
        phone: invoice.customer_phone,
        address: invoice.customer_address,
        license_number: invoice.license_number,
      },
      vehicle: {
        make: invoice.make,
        model: invoice.model,
        year: invoice.year,
        registration_number: invoice.registration_number,
        category: invoice.category_name,
        fuel_type: invoice.fuel_type,
        transmission: invoice.transmission,
        color: invoice.color,
      },
      rental: {
        booking_reference: invoice.booking_reference,
        pickup_datetime: invoice.pickup_datetime,
        return_datetime: invoice.return_datetime,
        actual_return_datetime: invoice.actual_return_datetime,
        rental_days: invoice.actual_days || invoice.booked_days,
        pickup_location: `${invoice.pickup_branch_name}, ${invoice.pickup_city}`,
        return_location: `${invoice.return_branch_name || invoice.pickup_branch_name}, ${invoice.return_city || invoice.pickup_city}`,
      },
      charges: {
        subtotal: invoice.subtotal,
        subtotal_formatted: formatCurrency(invoice.subtotal),
        discount: invoice.discount,
        discount_formatted: formatCurrency(invoice.discount),
        additional_charges: invoice.additional_charges,
        additional_charges_formatted: formatCurrency(invoice.additional_charges),
        damage_charges: invoice.damage_charges,
        damage_charges_formatted: formatCurrency(invoice.damage_charges),
        total: invoice.total_amount,
        total_formatted: formatCurrency(invoice.total_amount),
      },
    };

    return success(res, pdfData, 'Invoice PDF data generated successfully.');
  } catch (err) {
    console.error('generatePDF error:', err);
    return error(res, 'Failed to generate invoice data.', 500);
  }
};

module.exports = { getAll, getById, getMyInvoices, simulatePayment, generatePDF };
