const jwt = require('jsonwebtoken');

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'; // 30 minutes for patients
const JWT_PROVIDER_EXPIRES_IN = process.env.JWT_PROVIDER_EXPIRES_IN || '1h'; // 1 hour for providers

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @param {string} payload.patient_id - Patient ID
 * @param {string} payload.email - Patient email
 * @param {string} payload.role - User role (e.g., "patient")
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'health-first-api',
      audience: 'health-first-patients'
    });
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate JWT access token for providers (1 hour expiry)
 * @param {Object} payload - Token payload
 * @param {string} payload.provider_id - Provider ID
 * @param {string} payload.email - Provider email
 * @param {string} payload.role - User role (e.g., "provider")
 * @param {string} payload.specialization - Provider specialization
 * @returns {string} JWT token
 */
const generateProviderAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_PROVIDER_EXPIRES_IN,
      issuer: 'health-first-api',
      audience: 'health-first-providers'
    });
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'health-first-api',
      audience: 'health-first-patients'
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('JWT verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header
 * @returns {string|null} Token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Get token expiration time in seconds
 * @returns {number} Expiration time in seconds
 */
const getTokenExpirationTime = () => {
  const expiresIn = JWT_EXPIRES_IN;
  if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60; // Convert minutes to seconds
  } else if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60; // Convert hours to seconds
  } else if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60; // Convert days to seconds
  }
  return parseInt(expiresIn); // Assume seconds
};

const getProviderTokenExpirationTime = () => {
  const expiresIn = JWT_PROVIDER_EXPIRES_IN;
  if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60; // Convert minutes to seconds
  } else if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 60 * 60; // Convert hours to seconds
  } else if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 24 * 60 * 60; // Convert days to seconds
  }
  return parseInt(expiresIn); // Assume seconds
};

module.exports = {
  generateAccessToken,
  generateProviderAccessToken,
  verifyToken,
  extractTokenFromHeader,
  getTokenExpirationTime,
  getProviderTokenExpirationTime,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_PROVIDER_EXPIRES_IN
}; 