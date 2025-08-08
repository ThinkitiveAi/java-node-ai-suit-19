const { verifyToken, extractTokenFromHeader } = require('../utils/jwtUtils');
const { AppError } = require('./errorHandler');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next(new AppError('Access token is required', 401));
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Add user info to request object
    req.user = {
      id: decoded.patient_id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.message === 'Token has expired') {
      return next(new AppError('Token has expired', 401));
    } else if (error.message === 'Invalid token') {
      return next(new AppError('Invalid token', 401));
    } else {
      return next(new AppError('Authentication failed', 401));
    }
  }
};

/**
 * Middleware to check if user has required role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Middleware function
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.patient_id,
        email: decoded.email,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
}; 