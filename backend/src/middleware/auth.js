const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

/**
 * verifyToken - Extract Bearer token, verify with JWT_SECRET, attach user to req
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return error(res, 'Access denied. Invalid token format.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please login again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid token. Please login again.', 401);
    }
    return error(res, 'Token verification failed.', 401);
  }
};

/**
 * requireRole - Check req.user.role is in allowed roles
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

/**
 * optionalAuth - Like verifyToken but doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};

module.exports = { verifyToken, requireRole, optionalAuth };
