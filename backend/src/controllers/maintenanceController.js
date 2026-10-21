const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');

/**
 * GET /api/maintenance
 * Query maintenance_records
 */
const getAll = async (req, res) => {
  try {
    const { vehicle_id, status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (vehicle_id) { conditions.push('m.vehicle_id = ?'); params.push(vehicle_id); }
    if (status) { conditions.push('m.status = ?'); params.push(status); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM maintenance_records m ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [records] = await pool.query(
      `SELECT m.*,
              v.name AS vehicle_name, v.brand, v.model, v.vehicle_id,
              b.name AS branch_name, b.city AS branch_city
       FROM maintenance_records m
       JOIN vehicles v ON v.id = m.vehicle_id
       LEFT JOIN branches b ON b.id = m.branch_id
       ${whereClause}
       ORDER BY m.scheduled_date DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, records, total, page, limit);
  } catch (err) {
    console.error('Maintenance getAll error:', err);
    return error(res, 'Failed to fetch maintenance records: ' + err.message, 500);
  }
};

/**
 * POST /api/maintenance
 * Schedule new maintenance and set vehicle status=Maintenance
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const {
      vehicle_id,
      maintenance_type,
      description,
      scheduled_date,
      cost = 0,
      estimated_cost,
      performed_by,
      service_provider,
      branch_id,
    } = req.body;

    // Verify vehicle exists
    const [vehicles] = await pool.query('SELECT id, status, branch_id FROM vehicles WHERE id = ?', [vehicle_id]);
    if (vehicles.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    if (vehicles[0].status === 'Rented') {
      return error(res, 'Cannot schedule maintenance for a vehicle that is currently rented.', 400);
    }

    const assignedBranch = branch_id || vehicles[0].branch_id;
    const finalCost = parseFloat(cost || estimated_cost) || 0;
    const finalProvider = performed_by || service_provider || 'Authorized Service Station';

    const [result] = await pool.query(
      `INSERT INTO maintenance_records
        (vehicle_id, maintenance_type, description, cost, scheduled_date,
         performed_by, branch_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled', NOW())`,
      [
        vehicle_id,
        maintenance_type,
        description || 'Periodic maintenance and inspection',
        finalCost,
        scheduled_date || new Date().toISOString().split('T')[0],
        finalProvider,
        assignedBranch,
      ]
    );

    // Update vehicle status to Maintenance
    await pool.query(
      "UPDATE vehicles SET status = 'Maintenance', updated_at = NOW() WHERE id = ?",
      [vehicle_id]
    );

    const [newRecord] = await pool.query(
      `SELECT m.*, v.name AS vehicle_name, v.brand, v.model, v.vehicle_id
       FROM maintenance_records m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return success(res, newRecord[0], 'Maintenance scheduled successfully.', 201);
  } catch (err) {
    console.error('Maintenance create error:', err);
    return error(res, 'Failed to schedule maintenance: ' + err.message, 500);
  }
};

/**
 * PUT /api/maintenance/:id
 */
const update = async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM maintenance_records WHERE id = ?', [maintenanceId]);
    if (existing.length === 0) {
      return error(res, 'Maintenance record not found.', 404);
    }

    const {
      maintenance_type,
      description,
      scheduled_date,
      completed_date,
      cost,
      estimated_cost,
      performed_by,
      service_provider,
      status,
      branch_id,
    } = req.body;

    const finalCost = cost !== undefined ? parseFloat(cost) : (estimated_cost !== undefined ? parseFloat(estimated_cost) : null);
    const finalProvider = performed_by || service_provider || null;

    await pool.query(
      `UPDATE maintenance_records SET
        maintenance_type = COALESCE(?, maintenance_type),
        description = COALESCE(?, description),
        scheduled_date = COALESCE(?, scheduled_date),
        completed_date = COALESCE(?, completed_date),
        cost = COALESCE(?, cost),
        performed_by = COALESCE(?, performed_by),
        status = COALESCE(?, status),
        branch_id = COALESCE(?, branch_id)
       WHERE id = ?`,
      [
        maintenance_type || null,
        description || null,
        scheduled_date || null,
        completed_date || null,
        finalCost,
        finalProvider,
        status || null,
        branch_id || null,
        maintenanceId,
      ]
    );

    // If marked Completed, return vehicle to Available
    if (status === 'Completed') {
      await pool.query(
        "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ?",
        [existing[0].vehicle_id]
      );
    }

    const [updated] = await pool.query(
      `SELECT m.*, v.name AS vehicle_name, v.brand, v.model, v.vehicle_id
       FROM maintenance_records m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = ?`,
      [maintenanceId]
    );

    return success(res, updated[0], 'Maintenance record updated successfully.');
  } catch (err) {
    console.error('Maintenance update error:', err);
    return error(res, 'Failed to update maintenance record: ' + err.message, 500);
  }
};

/**
 * PUT /api/maintenance/:id/complete
 */
const complete = async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM maintenance_records WHERE id = ?', [maintenanceId]);
    if (existing.length === 0) {
      return error(res, 'Maintenance record not found.', 404);
    }

    const { actual_cost, cost, notes } = req.body;
    const finalCost = parseFloat(actual_cost || cost) || existing[0].cost;

    await pool.query(
      `UPDATE maintenance_records SET
        status = 'Completed',
        completed_date = CURDATE(),
        cost = ?,
        description = CONCAT(description, COALESCE(?, ''))
       WHERE id = ?`,
      [finalCost, notes ? ` [Notes: ${notes}]` : '', maintenanceId]
    );

    // Restore vehicle status to Available
    await pool.query(
      "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ?",
      [existing[0].vehicle_id]
    );

    const [updated] = await pool.query('SELECT * FROM maintenance_records WHERE id = ?', [maintenanceId]);

    return success(res, updated[0], 'Maintenance marked as completed and vehicle made Available.');
  } catch (err) {
    console.error('Maintenance complete error:', err);
    return error(res, 'Failed to complete maintenance: ' + err.message, 500);
  }
};

module.exports = { getAll, create, update, complete };
