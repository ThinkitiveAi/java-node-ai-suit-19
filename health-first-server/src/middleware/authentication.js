const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const { JWT_SECRET: DEFAULT_JWT_SECRET } = require('../utils/jwtUtils');

/**
 * Authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
		const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

		if (!token) {
			return res.status(401).json({
				error: 'Access denied. No token provided.',
				details: {
					statusCode: 401,
					status: 'fail',
					isOperational: true
				}
			});
		}

		jwt.verify(token, secret, (err, decoded) => {
			if (err) {
				if (err.name === 'TokenExpiredError') {
					return res.status(401).json({
						error: 'Token expired',
						details: {
							statusCode: 401,
							status: 'fail',
							isOperational: true
						}
					});
				}
				return res.status(403).json({
					error: 'Invalid token',
					details: {
						statusCode: 403,
						status: 'fail',
						isOperational: true
					}
				});
			}

			req.user = decoded;
			next();
		});
	} catch (error) {
		console.error('Authentication error:', error);
		return res.status(500).json({
			error: 'Internal server error during authentication',
			details: {
				statusCode: 500,
				status: 'error',
				isOperational: false
			}
		});
	}
};

/**
 * Authorize based on user roles
 */
const authorizeRoles = (roles) => {
	return (req, res, next) => {
		try {
			if (!req.user) {
				return res.status(401).json({
					error: 'Access denied. Authentication required.',
					details: {
						statusCode: 401,
						status: 'fail',
						isOperational: true
					}
				});
			}

			const userRole = req.user.role;
			
			if (!roles.includes(userRole)) {
				return res.status(403).json({
					error: 'Access denied. Insufficient permissions.',
					details: {
						statusCode: 403,
						status: 'fail',
						isOperational: true,
						requiredRoles: roles,
						userRole: userRole
					}
				});
			}

			next();
		} catch (error) {
			console.error('Authorization error:', error);
			return res.status(500).json({
				error: 'Internal server error during authorization',
				details: {
					statusCode: 500,
					status: 'error',
					isOperational: false
				}
			});
		}
	};
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
const optionalAuth = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];
		const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

		if (token) {
			jwt.verify(token, secret, (err, decoded) => {
				if (!err) {
					req.user = decoded;
				}
				next();
			});
		} else {
			next();
		}
	} catch (error) {
		console.error('Optional authentication error:', error);
		next();
	}
};

/**
 * Extract user ID from token
 */
const getUserId = (req) => {
	if (req.user) {
		return req.user.provider_id || req.user.patient_id;
	}
	return null;
};

/**
 * Check if user is a provider
 */
const isProvider = (req) => {
	return req.user && req.user.role === 'provider';
};

/**
 * Check if user is a patient
 */
const isPatient = (req) => {
	return req.user && req.user.role === 'patient';
};

/**
 * Verify token without throwing error
 */
const verifyToken = (token) => {
	try {
		const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
		return jwt.verify(token, secret);
	} catch (error) {
		return null;
	}
};

module.exports = {
	authenticateToken,
	authorizeRoles,
	optionalAuth,
	getUserId,
	isProvider,
	isPatient,
	verifyToken
}; 