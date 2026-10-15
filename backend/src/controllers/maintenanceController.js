const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');

/**
 * GET /api/maintenance
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
      `SELECT COUNT(*) AS total FROM maintenance m ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [records] = await pool.query(
      `SELECT m.*, v.make, v.model, v.registration_number, b.name AS branch_name
       FROM maintenance m
       JOIN vehicles v ON v.id = m.vehicle_id
       LEFT JOIN branches b ON b.id = v.branch_id
       ${whereClause}
       ORDER BY m.scheduled_date DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), offset]
    );

    return paginated(res, records, total, page, limit);
  } catch (err) {
    console.error('Maintenance getAll error:', err);
    return error(res, 'Failed to fetch maintenance records.', 500);
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
      estimated_cost,
      service_provider,
      notes,
    } = req.body;

    // Verify vehicle exists
    const [vehicles] = await pool.query('SELECT id, status FROM vehicles WHERE id = ?', [vehicle_id]);
    if (vehicles.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    if (vehicles[0].status === 'Rented') {
      return error(res, 'Cannot schedule maintenance for a vehicle that is currently rented.', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO maintenance
        (vehicle_id, maintenance_type, description, scheduled_date, estimated_cost,
         service_provider, status, notes, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, NOW(), NOW())`,
      [
        vehicle_id,
        maintenance_type,
        description || null,
        scheduled_date,
        estimated_cost || null,
        service_provider || null,
        notes || null,
        req.user.id,
      ]
    );

    // Update vehicle status to Maintenance
    await pool.query(
      "UPDATE vehicles SET status = 'Maintenance', updated_at = NOW() WHERE id = ?",
      [vehicle_id]
    );

    const [newRecord] = await pool.query(
      `SELECT m.*, v.make, v.model, v.registration_number
       FROM maintenance m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return success(res, newRecord[0], 'Maintenance scheduled successfully.', 201);
  } catch (err) {
    console.error('Maintenance create error:', err);
    return error(res, 'Failed to schedule maintenance.', 500);
  }
};

/**
 * PUT /api/maintenance/:id
 */
const update = async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM maintenance WHERE id = ?', [maintenanceId]);
    if (existing.length === 0) {
      return error(res, 'Maintenance record not found.', 404);
    }

    if (existing[0].status === 'Completed') {
      return error(res, 'Cannot edit a completed maintenance record.', 400);
    }

    const {
      maintenance_type,
      description,
      scheduled_date,
      estimated_cost,
      service_provider,
      notes,
      status,
    } = req.body;

    await pool.query(
      `UPDATE maintenance SET
        maintenance_type = COALESCE(?, maintenance_type),
        description = COALESCE(?, description),
        scheduled_date = COALESCE(?, scheduled_date),
        estimated_cost = COALESCE(?, estimated_cost),
        service_provider = COALESCE(?, service_provider),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [
        maintenance_type || null,
        description || null,
        scheduled_date || null,
        estimated_cost || null,
        service_provider || null,
        notes || null,
        status || null,
        maintenanceId,
      ]
    );

    const [updated] = await pool.query(
      `SELECT m.*, v.make, v.model, v.registration_number
       FROM maintenance m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = ?`,
      [maintenanceId]
    );

    return success(res, updated[0], 'Maintenance record updated.');
  } catch (err) {
    console.error('Maintenance update error:', err);
    return error(res, 'Failed to update maintenance record.', 500);
  }
};

/**
 * PUT /api/maintenance/:id/complete
 * Mark maintenance as completed, restore vehicle availability
 */
const complete = async (req, res) => {
  try {
    const maintenanceId = req.params.id;

    const [existing] = await pool.query('SELECT * FROM maintenance WHERE id = ?', [maintenanceId]);
    if (existing.length === 0) {
      return error(res, 'Maintenance record not found.', 404);
    }

    const maintenance = existing[0];

    if (maintenance.status === 'Completed') {
      return error(res, 'Maintenance is already completed.', 400);
    }

    const { actual_cost, completion_notes } = req.body;

    await pool.query(
      `UPDATE maintenance SET
        status = 'Completed',
        actual_cost = COALESCE(?, estimated_cost),
        completion_notes = ?,
        completed_date = NOW(),
        completed_by = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [actual_cost || null, completion_notes || null, req.user.id, maintenanceId]
    );

    // Restore vehicle to Available
    await pool.query(
      "UPDATE vehicles SET status = 'Available', updated_at = NOW() WHERE id = ?",
      [maintenance.vehicle_id]
    );

    const [updated] = await pool.query(
      `SELECT m.*, v.make, v.model, v.registration_number
       FROM maintenance m
       JOIN vehicles v ON v.id = m.vehicle_id
       WHERE m.id = ?`,
      [maintenanceId]
    );

    return success(res, updated[0], 'Maintenance completed. Vehicle is now available.');
  } catch (err) {
    console.error('Maintenance complete error:', err);
    return error(res, 'Failed to complete maintenance.', 500);
  }
};

module.exports = { getAll, create, update, complete };
