const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error } = require('../utils/response');

const { syncAllIndiaNetwork } = require('../../scripts/sync-all-india-network');

/**
 * GET /api/branches
 */
const getAll = async (req, res) => {
  try {
    const { state, city, search } = req.query;
    let query = `
      SELECT b.*,
             (SELECT COUNT(*) FROM vehicles WHERE branch_id = b.id AND status != 'Inactive') AS vehicle_count,
             (SELECT COUNT(*) FROM vehicles WHERE branch_id = b.id AND status = 'Available') AS available_count
      FROM branches b
      WHERE 1=1
    `;
    const params = [];

    if (state && state !== 'All') {
      query += ' AND b.state = ?';
      params.push(state);
    }
    if (city && city !== 'All') {
      query += ' AND b.city = ?';
      params.push(city);
    }
    if (search && search.trim()) {
      query += ' AND (b.name LIKE ? OR b.city LIKE ? OR b.state LIKE ? OR b.address LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY b.state ASC, b.city ASC, b.name ASC';
    const [branches] = await pool.query(query, params);
    return success(res, branches);
  } catch (err) {
    console.error('Branch getAll error:', err);
    return error(res, 'Failed to fetch branches: ' + err.message, 500);
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
      `SELECT v.id, v.name, v.brand, v.model, v.vehicle_id, v.status, v.daily_rate, v.image_url,
              vc.name AS category_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON vc.id = v.category_id
       WHERE v.branch_id = ? AND v.status != 'Inactive'
       ORDER BY v.name ASC`,
      [branch.id]
    );

    branch.vehicles = vehicles;
    branch.vehicle_count = vehicles.length;

    return success(res, branch);
  } catch (err) {
    console.error('Branch getById error:', err);
    return error(res, 'Failed to fetch branch: ' + err.message, 500);
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

    const {
      name,
      address = 'Hub Central',
      city = 'Bengaluru',
      state = 'Karnataka',
      pincode = '560001',
      phone = '9876543210',
      email,
      manager_name = 'Branch Manager',
      latitude = 12.9716,
      longitude = 77.5946,
      is_active = 1,
    } = req.body;

    const branchEmail = email || `branch.${Date.now()}@vektor.in`;

    const [result] = await pool.query(
      `INSERT INTO branches
        (name, address, city, state, pincode, phone, email, manager_name, latitude, longitude, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        name,
        address,
        city,
        state,
        pincode,
        phone,
        branchEmail,
        manager_name,
        parseFloat(latitude) || 12.9716,
        parseFloat(longitude) || 77.5946,
        is_active,
      ]
    );

    const [newBranch] = await pool.query('SELECT * FROM branches WHERE id = ?', [result.insertId]);

    return success(res, newBranch[0], 'Branch created successfully.', 201);
  } catch (err) {
    console.error('Branch create error:', err);
    return error(res, 'Failed to create branch: ' + err.message, 500);
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

    const {
      name,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      manager_name,
      latitude,
      longitude,
      is_active,
    } = req.body;

    await pool.query(
      `UPDATE branches SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        manager_name = COALESCE(?, manager_name),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        phone || null,
        email || null,
        manager_name || null,
        latitude !== undefined ? parseFloat(latitude) : null,
        longitude !== undefined ? parseFloat(longitude) : null,
        is_active !== undefined ? is_active : null,
        branchId,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM branches WHERE id = ?', [branchId]);

    return success(res, updated[0], 'Branch updated successfully.');
  } catch (err) {
    console.error('Branch update error:', err);
    return error(res, 'Failed to update branch: ' + err.message, 500);
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
        `Cannot delete branch. It has ${vehiclesInBranch[0].cnt} active vehicle(s). Reassign them first.`,
        400
      );
    }

    await pool.query('DELETE FROM branch_connections WHERE from_branch_id = ? OR to_branch_id = ?', [
      branchId,
      branchId,
    ]);
    await pool.query('DELETE FROM branches WHERE id = ?', [branchId]);

    return success(res, null, 'Branch deleted successfully.');
  } catch (err) {
    console.error('Branch delete error:', err);
    return error(res, 'Failed to delete branch: ' + err.message, 500);
  }
};

/**
 * GET /api/branches/connections
 * Return adjacency list for graph visualization adhering to schema.sql
 */
const getConnections = async (req, res) => {
  try {
    const [branches] = await pool.query('SELECT id, name, city, state, latitude, longitude FROM branches WHERE is_active = 1 ORDER BY state ASC, city ASC, name ASC');
    const [connections] = await pool.query(
      `SELECT bc.*,
              ba.name AS from_branch_name, ba.city AS from_city, ba.state AS from_state,
              bb.name AS to_branch_name, bb.city AS to_city, bb.state AS to_state
       FROM branch_connections bc
       JOIN branches ba ON ba.id = bc.from_branch_id
       JOIN branches bb ON bb.id = bc.to_branch_id
       WHERE bc.is_active = 1`
    );

    // Build adjacency list
    const adjacencyList = {};
    branches.forEach((b) => {
      adjacencyList[b.id] = [];
    });

    connections.forEach((c) => {
      if (adjacencyList[c.from_branch_id]) {
        adjacencyList[c.from_branch_id].push({
          branch_id: c.to_branch_id,
          name: c.to_branch_name,
          city: c.to_city,
          distance_km: Number(c.distance_km),
          travel_time_mins: c.travel_time_mins,
        });
      }
      // Also record bidirectional neighbor if not present
      if (adjacencyList[c.to_branch_id]) {
        adjacencyList[c.to_branch_id].push({
          branch_id: c.from_branch_id,
          name: c.from_branch_name,
          city: c.from_city,
          distance_km: Number(c.distance_km),
          travel_time_mins: c.travel_time_mins,
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
    return error(res, 'Failed to fetch branch connections: ' + err.message, 500);
  }
};

/**
 * POST /api/branches/connections (admin)
 */
const addConnection = async (req, res) => {
  try {
    const from_branch_id = req.body.from_branch_id || req.body.branch_id_a;
    const to_branch_id = req.body.to_branch_id || req.body.branch_id_b;
    const distance_km = parseFloat(req.body.distance_km) || 10;
    const travel_time_mins = parseInt(req.body.travel_time_mins || req.body.travel_time_min, 10) || 30;

    if (!from_branch_id || !to_branch_id) {
      return error(res, 'from_branch_id and to_branch_id are required.', 400);
    }

    if (from_branch_id === to_branch_id) {
      return error(res, 'Cannot connect a branch to itself.', 400);
    }

    // Check both branches exist
    const [branchesExist] = await pool.query(
      'SELECT id FROM branches WHERE id IN (?, ?)',
      [from_branch_id, to_branch_id]
    );
    if (branchesExist.length < 2) {
      return error(res, 'One or both branches do not exist.', 404);
    }

    // Check for duplicate
    const [dup] = await pool.query(
      'SELECT id FROM branch_connections WHERE (from_branch_id = ? AND to_branch_id = ?) OR (from_branch_id = ? AND to_branch_id = ?)',
      [from_branch_id, to_branch_id, to_branch_id, from_branch_id]
    );
    if (dup.length > 0) {
      return error(res, 'A connection between these branches already exists.', 409);
    }

    const [result] = await pool.query(
      `INSERT INTO branch_connections (from_branch_id, to_branch_id, distance_km, travel_time_mins, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [from_branch_id, to_branch_id, distance_km, travel_time_mins]
    );

    const [newConn] = await pool.query(
      `SELECT bc.*, ba.name AS from_branch_name, bb.name AS to_branch_name
       FROM branch_connections bc
       JOIN branches ba ON ba.id = bc.from_branch_id
       JOIN branches bb ON bb.id = bc.to_branch_id
       WHERE bc.id = ?`,
      [result.insertId]
    );

    return success(res, newConn[0], 'Branch connection added successfully.', 201);
  } catch (err) {
    console.error('addConnection error:', err);
    return error(res, 'Failed to add branch connection: ' + err.message, 500);
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
    return error(res, 'Failed to remove branch connection: ' + err.message, 500);
  }
};

/**
 * POST /api/branches/sync-csv (admin)
 */
const syncCsv = async (req, res) => {
  try {
    const result = await syncAllIndiaNetwork();
    return success(res, result, 'All-India rental network synchronized successfully from CSV.');
  } catch (err) {
    console.error('syncCsv error:', err);
    return error(res, 'Failed to sync CSV: ' + err.message, 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getConnections,
  addConnection,
  removeConnection,
  syncCsv,
};
