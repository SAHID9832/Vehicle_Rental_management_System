const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { success, error, paginated } = require('../utils/response');

/**
 * GET /api/vehicles
 * Get all vehicles with filters, pagination, sorting
 */
const getAll = async (req, res) => {
  try {
    const {
      category,
      status,
      branch,
      fuel_type,
      transmission,
      min_price,
      max_price,
      search,
      page = 1,
      limit = 10,
      sort = 'asc',
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (category) { conditions.push('vc.name = ?'); params.push(category); }
    if (status) { conditions.push('v.status = ?'); params.push(status); }
    if (branch) { conditions.push('v.branch_id = ?'); params.push(branch); }
    if (fuel_type) { conditions.push('v.fuel_type = ?'); params.push(fuel_type); }
    if (transmission) { conditions.push('v.transmission = ?'); params.push(transmission); }
    if (min_price) { conditions.push('v.daily_rate >= ?'); params.push(parseFloat(min_price)); }
    if (max_price) { conditions.push('v.daily_rate <= ?'); params.push(parseFloat(max_price)); }
    if (search) {
      conditions.push('(v.make LIKE ? OR v.model LIKE ? OR v.registration_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortDir = sort === 'desc' ? 'DESC' : 'ASC';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM vehicles v
      LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
      LEFT JOIN branches b ON v.branch_id = b.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT v.*, vc.name AS category_name, b.name AS branch_name, b.city AS branch_city
      FROM vehicles v
      LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
      LEFT JOIN branches b ON v.branch_id = b.id
      ${whereClause}
      ORDER BY v.daily_rate ${sortDir}
      LIMIT ? OFFSET ?
    `;
    const [vehicles] = await pool.query(dataSql, [...params, parseInt(limit, 10), offset]);

    return paginated(res, vehicles, total, page, limit);
  } catch (err) {
    console.error('Vehicle getAll error:', err);
    return error(res, 'Failed to fetch vehicles.', 500);
  }
};

/**
 * GET /api/vehicles/:id
 */
const getById = async (req, res) => {
  try {
    const [vehicles] = await pool.query(
      `SELECT v.*, vc.name AS category_name, vc.description AS category_description,
              b.name AS branch_name, b.city AS branch_city, b.address AS branch_address,
              b.phone AS branch_phone
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
       LEFT JOIN branches b ON v.branch_id = b.id
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (vehicles.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    return success(res, vehicles[0]);
  } catch (err) {
    console.error('Vehicle getById error:', err);
    return error(res, 'Failed to fetch vehicle.', 500);
  }
};

/**
 * POST /api/vehicles
 */
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const {
      registration_number,
      make,
      model,
      year,
      category_id,
      branch_id,
      daily_rate,
      fuel_type,
      transmission,
      seating_capacity,
      color,
      mileage,
      description,
      image_url,
      status = 'Available',
    } = req.body;

    // Check duplicate registration number
    const [existing] = await pool.query(
      'SELECT id FROM vehicles WHERE registration_number = ?',
      [registration_number]
    );
    if (existing.length > 0) {
      return error(res, 'A vehicle with this registration number already exists.', 409);
    }

    const [result] = await pool.query(
      `INSERT INTO vehicles
        (registration_number, make, model, year, category_id, branch_id, daily_rate,
         fuel_type, transmission, seating_capacity, color, mileage, description, image_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        registration_number, make, model, year, category_id, branch_id, daily_rate,
        fuel_type, transmission, seating_capacity || null, color || null,
        mileage || null, description || null, image_url || null, status,
      ]
    );

    const [newVehicle] = await pool.query(
      `SELECT v.*, vc.name AS category_name, b.name AS branch_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
       LEFT JOIN branches b ON v.branch_id = b.id
       WHERE v.id = ?`,
      [result.insertId]
    );

    return success(res, newVehicle[0], 'Vehicle created successfully.', 201);
  } catch (err) {
    console.error('Vehicle create error:', err);
    return error(res, 'Failed to create vehicle.', 500);
  }
};

/**
 * PUT /api/vehicles/:id
 */
const update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 'Validation failed', 400, errors.array());
    }

    const vehicleId = req.params.id;

    const [existing] = await pool.query('SELECT id FROM vehicles WHERE id = ?', [vehicleId]);
    if (existing.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    const {
      registration_number, make, model, year, category_id, branch_id, daily_rate,
      fuel_type, transmission, seating_capacity, color, mileage, description, image_url, status,
    } = req.body;

    // Check duplicate registration number (excluding current vehicle)
    if (registration_number) {
      const [dupCheck] = await pool.query(
        'SELECT id FROM vehicles WHERE registration_number = ? AND id != ?',
        [registration_number, vehicleId]
      );
      if (dupCheck.length > 0) {
        return error(res, 'Another vehicle with this registration number already exists.', 409);
      }
    }

    await pool.query(
      `UPDATE vehicles SET
        registration_number = COALESCE(?, registration_number),
        make = COALESCE(?, make),
        model = COALESCE(?, model),
        year = COALESCE(?, year),
        category_id = COALESCE(?, category_id),
        branch_id = COALESCE(?, branch_id),
        daily_rate = COALESCE(?, daily_rate),
        fuel_type = COALESCE(?, fuel_type),
        transmission = COALESCE(?, transmission),
        seating_capacity = COALESCE(?, seating_capacity),
        color = COALESCE(?, color),
        mileage = COALESCE(?, mileage),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [
        registration_number || null, make || null, model || null, year || null,
        category_id || null, branch_id || null, daily_rate || null, fuel_type || null,
        transmission || null, seating_capacity || null, color || null, mileage || null,
        description || null, image_url || null, status || null, vehicleId,
      ]
    );

    const [updated] = await pool.query(
      `SELECT v.*, vc.name AS category_name, b.name AS branch_name
       FROM vehicles v
       LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
       LEFT JOIN branches b ON v.branch_id = b.id
       WHERE v.id = ?`,
      [vehicleId]
    );

    return success(res, updated[0], 'Vehicle updated successfully.');
  } catch (err) {
    console.error('Vehicle update error:', err);
    return error(res, 'Failed to update vehicle.', 500);
  }
};

/**
 * DELETE /api/vehicles/:id
 * Soft delete: set status to Inactive
 */
const remove = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const [existing] = await pool.query('SELECT id, status FROM vehicles WHERE id = ?', [vehicleId]);
    if (existing.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    if (existing[0].status === 'Rented') {
      return error(res, 'Cannot deactivate a vehicle that is currently rented.', 400);
    }

    await pool.query(
      'UPDATE vehicles SET status = ?, updated_at = NOW() WHERE id = ?',
      ['Inactive', vehicleId]
    );

    return success(res, null, 'Vehicle deactivated successfully.');
  } catch (err) {
    console.error('Vehicle delete error:', err);
    return error(res, 'Failed to deactivate vehicle.', 500);
  }
};

/**
 * GET /api/vehicles/categories
 */
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT *, (SELECT COUNT(*) FROM vehicles WHERE category_id = vehicle_categories.id) AS vehicle_count FROM vehicle_categories ORDER BY name ASC'
    );
    return success(res, categories);
  } catch (err) {
    console.error('getCategories error:', err);
    return error(res, 'Failed to fetch vehicle categories.', 500);
  }
};

/**
 * GET /api/vehicles/:id/availability
 * Check vehicle availability for given date range
 */
const checkAvailability = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { pickup_datetime, return_datetime } = req.query;

    if (!pickup_datetime || !return_datetime) {
      return error(res, 'pickup_datetime and return_datetime are required.', 400);
    }

    const [vehicle] = await pool.query(
      'SELECT id, make, model, status, daily_rate FROM vehicles WHERE id = ?',
      [vehicleId]
    );

    if (vehicle.length === 0) {
      return error(res, 'Vehicle not found.', 404);
    }

    if (vehicle[0].status === 'Inactive' || vehicle[0].status === 'Maintenance') {
      return success(res, {
        available: false,
        reason: `Vehicle is currently ${vehicle[0].status.toLowerCase()}.`,
        vehicle: vehicle[0],
      });
    }

    // Check for overlapping bookings
    const [overlapping] = await pool.query(
      `SELECT id FROM bookings
       WHERE vehicle_id = ?
         AND status NOT IN ('Cancelled')
         AND NOT (return_datetime <= ? OR pickup_datetime >= ?)`,
      [vehicleId, pickup_datetime, return_datetime]
    );

    const available = overlapping.length === 0;

    return success(res, {
      available,
      reason: available ? null : 'Vehicle is already booked for the requested dates.',
      vehicle: vehicle[0],
      overlapping_bookings: overlapping.length,
    });
  } catch (err) {
    console.error('checkAvailability error:', err);
    return error(res, 'Failed to check vehicle availability.', 500);
  }
};

/**
 * GET /api/vehicles/search/available
 * Get available vehicles for a search (pickup branch, return branch, dates, category)
 */
const getAvailableForSearch = async (req, res) => {
  try {
    const {
      pickup_branch_id,
      return_branch_id,
      pickup_datetime,
      return_datetime,
      category,
      page = 1,
      limit = 10,
    } = req.query;

    if (!pickup_datetime || !return_datetime) {
      return error(res, 'pickup_datetime and return_datetime are required.', 400);
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [
      "v.status = 'Available'",
      `v.id NOT IN (
        SELECT vehicle_id FROM bookings
        WHERE status NOT IN ('Cancelled')
        AND NOT (return_datetime <= ? OR pickup_datetime >= ?)
      )`,
    ];
    const params = [pickup_datetime, return_datetime];

    if (pickup_branch_id) { conditions.push('v.branch_id = ?'); params.push(pickup_branch_id); }
    if (category) { conditions.push('vc.name = ?'); params.push(category); }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM vehicles v
      LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
      LEFT JOIN branches b ON v.branch_id = b.id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countSql, params);
    const total = countResult[0].total;

    const dataSql = `
      SELECT v.*, vc.name AS category_name, b.name AS branch_name, b.city AS branch_city
      FROM vehicles v
      LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
      LEFT JOIN branches b ON v.branch_id = b.id
      ${whereClause}
      ORDER BY v.daily_rate ASC
      LIMIT ? OFFSET ?
    `;
    const [vehicles] = await pool.query(dataSql, [...params, parseInt(limit, 10), offset]);

    return paginated(res, vehicles, total, page, limit);
  } catch (err) {
    console.error('getAvailableForSearch error:', err);
    return error(res, 'Failed to search available vehicles.', 500);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getCategories,
  checkAvailability,
  getAvailableForSearch,
};
