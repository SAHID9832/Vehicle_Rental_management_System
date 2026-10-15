const pool = require('../config/database');
const { success, error } = require('../utils/response');

/**
 * GET /api/dashboard/stats
 * Aggregated dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    // Vehicle stats
    const [vehicleStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_vehicles,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END) AS rented,
        SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END) AS reserved,
        SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) AS inactive
      FROM vehicles
    `);

    // Booking stats
    const [bookingStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
      FROM bookings
    `);

    // Active rentals count
    const [rentalStats] = await pool.query(`
      SELECT
        COUNT(*) AS active_rentals,
        SUM(CASE WHEN expected_return_datetime < NOW() AND status = 'Active' THEN 1 ELSE 0 END) AS overdue_rentals
      FROM rentals
      WHERE status = 'Active'
    `);

    // Customer count
    const [customerStats] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');

    // Revenue stats
    const [revenueStats] = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(*) AS paid_invoices
      FROM invoices
      WHERE status = 'Paid'
    `);

    // Monthly revenue for last 6 months
    const [monthlyRevenue] = await pool.query(`
      SELECT
        DATE_FORMAT(paid_at, '%Y-%m') AS month,
        DATE_FORMAT(paid_at, '%b %Y') AS month_label,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS invoice_count
      FROM invoices
      WHERE status = 'Paid'
        AND paid_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(paid_at, '%Y-%m'), DATE_FORMAT(paid_at, '%b %Y')
      ORDER BY month ASC
    `);

    // Bookings by vehicle category
    const [bookingsByCategory] = await pool.query(`
      SELECT
        vc.name AS category,
        COUNT(bk.id) AS total_bookings,
        SUM(CASE WHEN bk.status = 'Completed' THEN 1 ELSE 0 END) AS completed_bookings
      FROM vehicle_categories vc
      LEFT JOIN vehicles v ON v.category_id = vc.id
      LEFT JOIN bookings bk ON bk.vehicle_id = v.id
      GROUP BY vc.id, vc.name
      ORDER BY total_bookings DESC
    `);

    // Vehicle utilization by category
    const [vehiclesByCategory] = await pool.query(`
      SELECT vc.name AS category, COUNT(*) AS count,
             SUM(CASE WHEN v.status = 'Available' THEN 1 ELSE 0 END) AS available
      FROM vehicle_categories vc
      LEFT JOIN vehicles v ON v.category_id = vc.id AND v.status != 'Inactive'
      GROUP BY vc.id, vc.name
      ORDER BY count DESC
    `);

    // Recent activity (last 10 bookings)
    const [recentActivity] = await pool.query(`
      SELECT bk.id, bk.booking_reference, bk.status, bk.created_at,
             bk.total_amount, bk.pickup_datetime, bk.return_datetime,
             c.name AS customer_name,
             v.make, v.model
      FROM bookings bk
      LEFT JOIN customers c ON c.id = bk.customer_id
      LEFT JOIN vehicles v ON v.id = bk.vehicle_id
      ORDER BY bk.created_at DESC
      LIMIT 10
    `);

    // Branch performance
    const [branchStats] = await pool.query(`
      SELECT b.name AS branch_name, b.city,
             COUNT(DISTINCT v.id) AS total_vehicles,
             SUM(CASE WHEN v.status = 'Available' THEN 1 ELSE 0 END) AS available_vehicles,
             COUNT(DISTINCT bk.id) AS total_bookings
      FROM branches b
      LEFT JOIN vehicles v ON v.branch_id = b.id AND v.status != 'Inactive'
      LEFT JOIN bookings bk ON bk.pickup_branch_id = b.id
      WHERE b.is_active = 1
      GROUP BY b.id, b.name, b.city
      ORDER BY total_bookings DESC
    `);

    return success(res, {
      vehicles: vehicleStats[0],
      bookings: bookingStats[0],
      rentals: rentalStats[0],
      customers: customerStats[0],
      revenue: revenueStats[0],
      monthly_revenue: monthlyRevenue,
      bookings_by_category: bookingsByCategory,
      vehicles_by_category: vehiclesByCategory,
      branch_stats: branchStats,
      recent_activity: recentActivity,
    });
  } catch (err) {
    console.error('Dashboard getStats error:', err);
    return error(res, 'Failed to fetch dashboard statistics.', 500);
  }
};

module.exports = { getStats };
