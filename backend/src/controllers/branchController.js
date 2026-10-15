const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error } = require('../utils/response');

/**
 * GET /api/branches
 */
const getAll = async (req, res) => {
  try {
    const [branches] = await pool.query(
      `SELECT b.*,
              (SELECT COUNT(*) FROM vehicles WHERE branch_id = b.id AND status != 'Inactive') AS vehicle_count,
              (SELECT COUNT(*) FROM vehicles WHERE branch_id = b.id AND status = 'Available') AS available_count
       FROM branches b
       ORDER BY b.name ASC`
    );
    return success(res, branches);
  } catch (err) {
    console.error('Branch getAll error:', err);
    return error(res, 'Failed to fetch branches.', 500);
  }
};

/**
 * GET /api/branches/:id
 */
const getById = async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT * FROM branches WHERE id = ?', [req.params.id]);

    if (branches.length === 0) {
      return error(res, 'Branch not found.', 404);
    }

    const branch = branches[0];

    const [vehicles] = await pool.query(
      `SELECT v.id, v.make, v.model, v.registration_number, v.status, v.daily_rate, v.image_url,
              vc.name AS category_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       WHERE v.branch_id = ? AND v.status != 'Inactive'
       ORDER BY v.make ASC`,
      [branch.id]
    );

    branch.vehicles = vehicles;
    branch.vehicle_count = vehicles.length;

    return success(res, branch);
  } catch (err) {
    console.error('Branch getById error:', err);
    return error(res, 'Failed to fetch branch.', 500);
  }
};

/**
 * POST /api/branches (admin)
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const { name, city, address, phone, email, latitude, longitude, is_active = 1 } = req.body;

    const [result] = await pool.query(
      `INSERT INTO branches (name, city, address, phone, email, latitude, longitude, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, city, address || null, phone || null, email || null, latitude || null, longitude || null, is_active]
    );

    const [newBranch] = await pool.query('SELECT * FROM branches WHERE id = ?', [result.insertId]);

    return success(res, newBranch[0], 'Branch created successfully.', 201);
  } catch (err) {
    console.error('Branch create error:', err);
    return error(res, 'Failed to create branch.', 500);
  }
};

/**
 * PUT /api/branches/:id (admin)
 */
const update = async (req, res) => {
  try {
    const branchId = req.params.id;

    const [existing] = await pool.query('SELECT id FROM branches WHERE id = ?', [branchId]);
    if (existing.length === 0) {
      return error(res, 'Branch not found.', 404);
    }

    const { name, city, address, phone, email, latitude, longitude, is_active } = req.body;

    await pool.query(
      `UPDATE branches SET
        name = COALESCE(?, name),
        city = COALESCE(?, city),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
       WHERE id = ?`,
      [
        name || null, city || null, address || null, phone || null, email || null,
        latitude || null, longitude || null,
        is_active !== undefined ? is_active : null,
        branchId,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM branches WHERE id = ?', [branchId]);

    return success(res, updated[0], 'Branch updated successfully.');
  } catch (err) {
    console.error('Branch update error:', err);
    return error(res, 'Failed to update branch.', 500);
  }
};

/**
 * DELETE /api/branches/:id (admin)
 */
const remove = async (req, res) => {
  try {
    const branchId = req.params.id;

    const [existing] = await pool.query('SELECT id FROM branches WHERE id = ?', [branchId]);
    if (existing.length === 0) {
      return error(res, 'Branch not found.', 404);
    }

    const [vehiclesInBranch] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM vehicles WHERE branch_id = ? AND status NOT IN ('Inactive')",
      [branchId]
    );
    if (vehiclesInBranch[0].cnt > 0) {
      return error(
        res,
        `Cannot delete branch. It has ${vehiclesInBranch[0].cnt} active vehicle(s).`,
        400
      );
    }

    await pool.query('DELETE FROM branch_connections WHERE branch_id_a = ? OR branch_id_b = ?', [
      branchId,
      branchId,
    ]);
    await pool.query('DELETE FROM branches WHERE id = ?', [branchId]);

    return success(res, null, 'Branch deleted successfully.');
  } catch (err) {
    console.error('Branch delete error:', err);
    return error(res, 'Failed to delete branch.', 500);
  }
};

/**
 * GET /api/branches/connections
 * Return adjacency list for graph visualization
 */
const getConnections = async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT id, name, city FROM branches ORDER BY name ASC');
    const [connections] = await pool.query(
      `SELECT bc.*, ba.name AS branch_a_name, bb.name AS branch_b_name,
              ba.city AS city_a, bb.city AS city_b
       FROM branch_connections bc
       JOIN branches ba ON ba.id = bc.branch_id_a
       JOIN branches bb ON bb.id = bc.branch_id_b`
    );

    // Build adjacency list
    const adjacencyList = {};
    branches.forEach((b) => {
      adjacencyList[b.id] = [];
    });

    connections.forEach((c) => {
      adjacencyList[c.branch_id_a].push({
        branch_id: c.branch_id_b,
        name: c.branch_b_name,
        city: c.city_b,
        distance_km: c.distance_km,
        travel_time_min: c.travel_time_min,
      });
      if (!c.is_directed) {
        adjacencyList[c.branch_id_b].push({
          branch_id: c.branch_id_a,
          name: c.branch_a_name,
          city: c.city_a,
          distance_km: c.distance_km,
          travel_time_min: c.travel_time_min,
        });
      }
    });

    return success(res, {
      nodes: branches,
      edges: connections,
      adjacencyList,
    });
  } catch (err) {
    console.error('getConnections error:', err);
    return error(res, 'Failed to fetch branch connections.', 500);
  }
};

/**
 * POST /api/branches/connections (admin)
 */
const addConnection = async (req, res) => {
  try {
    const { branch_id_a, branch_id_b, distance_km, travel_time_min, is_directed = 0 } = req.body;

    if (!branch_id_a || !branch_id_b) {
      return error(res, 'branch_id_a and branch_id_b are required.', 400);
    }

    if (branch_id_a === branch_id_b) {
      return error(res, 'Cannot connect a branch to itself.', 400);
    }

    // Check both branches exist
    const [branchesExist] = await pool.query(
      'SELECT id FROM branches WHERE id IN (?, ?)',
      [branch_id_a, branch_id_b]
    );
    if (branchesExist.length < 2) {
      return error(res, 'One or both branches do not exist.', 404);
    }

    // Check for duplicate
    const [dup] = await pool.query(
      'SELECT id FROM branch_connections WHERE (branch_id_a = ? AND branch_id_b = ?) OR (branch_id_a = ? AND branch_id_b = ?)',
      [branch_id_a, branch_id_b, branch_id_b, branch_id_a]
    );
    if (dup.length > 0) {
      return error(res, 'Connection between these branches already exists.', 409);
    }

    const [result] = await pool.query(
      `INSERT INTO branch_connections (branch_id_a, branch_id_b, distance_km, travel_time_min, is_directed, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [branch_id_a, branch_id_b, distance_km || null, travel_time_min || null, is_directed]
    );

    const [newConn] = await pool.query(
      `SELECT bc.*, ba.name AS branch_a_name, bb.name AS branch_b_name
       FROM branch_connections bc
       JOIN branches ba ON ba.id = bc.branch_id_a
       JOIN branches bb ON bb.id = bc.branch_id_b
       WHERE bc.id = ?`,
      [result.insertId]
    );

    return success(res, newConn[0], 'Branch connection added successfully.', 201);
  } catch (err) {
    console.error('addConnection error:', err);
    return error(res, 'Failed to add branch connection.', 500);
  }
};

/**
 * DELETE /api/branches/connections/:id (admin)
 */
const removeConnection = async (req, res) => {
  try {
    const connId = req.params.id;

    const [existing] = await pool.query('SELECT id FROM branch_connections WHERE id = ?', [connId]);
    if (existing.length === 0) {
      return error(res, 'Connection not found.', 404);
    }

    await pool.query('DELETE FROM branch_connections WHERE id = ?', [connId]);

    return success(res, null, 'Branch connection removed successfully.');
  } catch (err) {
    console.error('removeConnection error:', err);
    return error(res, 'Failed to remove branch connection.', 500);
  }
};

module.exports = { getAll, getById, create, update, remove, getConnections, addConnection, removeConnection };
