const pool = require('../config/database');
const { success, error } = require('../utils/response');

/**
 * GET /api/dashboard/stats
 * Aggregated live dashboard statistics directly from MySQL database tables
 */
const getStats = async (req, res) => {
  try {
    // 1. Vehicle counts
    const [vehicleStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_vehicles,
        COALESCE(SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END), 0) AS available,
        COALESCE(SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END), 0) AS rented,
        COALESCE(SUM(CASE WHEN status = 'Reserved' THEN 1 ELSE 0 END), 0) AS reserved,
        COALESCE(SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END), 0) AS maintenance,
        COALESCE(SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END), 0) AS inactive
      FROM vehicles
    `);

    // 2. Booking counts
    const [bookingStats] = await pool.query(`
      SELECT
        COUNT(*) AS total_bookings,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END), 0) AS confirmed,
        COALESCE(SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END), 0) AS active,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) AS completed,
        COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END), 0) AS cancelled
      FROM bookings
    `);

    // 3. Active rentals
    const [rentalStats] = await pool.query(`
      SELECT
        COUNT(*) AS active_rentals,
        COALESCE(SUM(CASE WHEN expected_return_datetime < NOW() AND status = 'Active' THEN 1 ELSE 0 END), 0) AS overdue_rentals
      FROM rentals
      WHERE status = 'Active'
    `);

    // 4. Customer count
    const [customerStats] = await pool.query('SELECT COUNT(*) AS total_customers FROM customers');

    // 5. Total Revenue (sum of paid invoices or completed bookings)
    const [revenueStats] = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(*) AS paid_invoices
      FROM invoices
      WHERE payment_status = 'Paid'
    `);

    // Fallback if no invoices paid yet in fresh seed: use completed bookings sum
    let totalRevenue = parseFloat(revenueStats[0].total_revenue) || 0;
    if (totalRevenue === 0) {
      const [bookingRev] = await pool.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS rev
        FROM bookings
        WHERE status IN ('Completed', 'Active')
      `);
      totalRevenue = parseFloat(bookingRev[0].rev) || 0;
    }

    // 6. Monthly revenue for last 6 months (based on invoices / bookings)
    const [monthlyRevenueRows] = await pool.query(`
      SELECT
        DATE_FORMAT(b.created_at, '%b %Y') AS month,
        DATE_FORMAT(b.created_at, '%Y-%m') AS month_sort,
        COALESCE(SUM(b.total_amount), 0) AS revenue,
        COUNT(b.id) AS bookings
      FROM bookings b
      WHERE b.status != 'Cancelled'
        AND b.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month_sort, month
      ORDER BY month_sort ASC
    `);

    // 7. Bookings by vehicle category
    const [bookingsByCategoryRows] = await pool.query(`
      SELECT
        vc.name AS category,
        COUNT(bk.id) AS count,
        COALESCE(SUM(bk.total_amount), 0) AS revenue
      FROM vehicle_categories vc
      LEFT JOIN vehicles v ON v.category_id = vc.id
      LEFT JOIN bookings bk ON bk.vehicle_id = v.id AND bk.status != 'Cancelled'
      GROUP BY vc.id, vc.name
      ORDER BY count DESC
    `);

    // 8. Recent activity (last 10 bookings) with joined schema names
    const [recentActivity] = await pool.query(`
      SELECT bk.*,
             CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
             u.email AS customer_email,
             v.name AS vehicle_name, v.brand, v.model, v.vehicle_id, v.image_url,
             pb.name AS pickup_branch_name,
             rb.name AS return_branch_name
      FROM bookings bk
      LEFT JOIN customers c ON c.id = bk.customer_id
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN vehicles v ON v.id = bk.vehicle_id
      LEFT JOIN branches pb ON pb.id = bk.pickup_branch_id
      LEFT JOIN branches rb ON rb.id = bk.return_branch_id
      ORDER BY bk.created_at DESC
      LIMIT 10
    `);

    const vData = vehicleStats[0];
    const bData = bookingStats[0];

    // Payload matching DashboardStats interface in frontend
    const payload = {
      totalVehicles: parseInt(vData.total_vehicles, 10) || 0,
      availableVehicles: parseInt(vData.available, 10) || 0,
      rentedVehicles: parseInt(vData.rented, 10) || 0,
      reservedVehicles: parseInt(vData.reserved, 10) || 0,
      maintenanceVehicles: parseInt(vData.maintenance, 10) || 0,
      totalBookings: parseInt(bData.total_bookings, 10) || 0,
      activeRentals: parseInt(rentalStats[0].active_rentals, 10) || 0,
      totalCustomers: parseInt(customerStats[0].total_customers, 10) || 0,
      totalRevenue,
      monthlyRevenue: monthlyRevenueRows.map((r) => ({
        month: r.month,
        revenue: parseFloat(r.revenue) || 0,
        bookings: parseInt(r.bookings, 10) || 0,
      })),
      bookingsByCategory: bookingsByCategoryRows.map((r) => ({
        category: r.category,
        count: parseInt(r.count, 10) || 0,
        revenue: parseFloat(r.revenue) || 0,
      })),
      recentActivity,

      // Also maintain nested objects for backward compatibility
      vehicles: vData,
      bookings: bData,
      rentals: rentalStats[0],
      customers: customerStats[0],
      revenue: revenueStats[0],
    };

    return success(res, payload);
  } catch (err) {
    console.error('Dashboard getStats error:', err);
    return error(res, 'Failed to fetch dashboard statistics: ' + err.message, 500);
  }
};

module.exports = { getStats };
