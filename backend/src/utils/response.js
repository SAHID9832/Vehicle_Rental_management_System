/**
 * Consistent JSON response helpers for Vektor Rentals API
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 400)
 * @param {*} errors - Validation errors or additional details
 */
const error = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors !== null) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {object} res - Express response object
 * @param {Array} data - Array of records
 * @param {number} total - Total record count
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 */
const paginated = (res, data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message: 'Data retrieved successfully',
    data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = { success, error, paginated };
