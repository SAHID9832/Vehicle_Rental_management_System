const { body, query, validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed: ' + errors.array().map((e) => e.msg).join(', '), 400, errors.array());
  }
  next();
};

const registerValidation = [
  body('email').isEmail().withMessage('Valid email address is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  validate,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const bookingValidation = [
  body('vehicle_id').isInt({ min: 1 }).withMessage('Valid vehicle_id is required'),
  body('pickup_branch_id').isInt({ min: 1 }).withMessage('Valid pickup_branch_id is required'),
  body('return_branch_id').isInt({ min: 1 }).withMessage('Valid return_branch_id is required'),
  body('pickup_datetime').isISO8601().withMessage('Valid pickup datetime is required'),
  body('return_datetime').isISO8601().withMessage('Valid return datetime is required'),
  validate,
];

const vehicleValidation = [
  body('vehicle_id').trim().notEmpty().withMessage('Vehicle ID (code) is required'),
  body('name').trim().notEmpty().withMessage('Vehicle name is required'),
  body('model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('brand').trim().notEmpty().withMessage('Vehicle brand is required'),
  body('daily_rate').isFloat({ min: 1 }).withMessage('Daily rate must be greater than 0'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id is required'),
  body('branch_id').isInt({ min: 1 }).withMessage('Valid branch_id is required'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  bookingValidation,
  vehicleValidation,
};
