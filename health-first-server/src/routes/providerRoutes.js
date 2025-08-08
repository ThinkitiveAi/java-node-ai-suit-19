const express = require('express');
const router = express.Router();

const {
  registerProvider,
  loginProvider,
  getSpecializations,
  getProvidersBySpecialization,
  getProviderById,
  checkEmailExists,
  checkLicenseExists,
  getProviderStats
} = require('../controllers/providerController');

const {
  validateProviderRegistration,
  validateSpecialization
} = require('../middleware/validation');

const {
  validateProviderLogin
} = require('../middleware/providerLoginValidation');

// @route   POST /api/v1/provider/register
// @desc    Register a new provider
// @access  Public
router.post('/register', validateProviderRegistration, registerProvider);

// @route   POST /api/v1/provider/login
// @desc    Login provider
// @access  Public
router.post('/login', validateProviderLogin, loginProvider);

// @route   GET /api/v1/provider/specializations
// @desc    Get all available specializations
// @access  Public
router.get('/specializations', getSpecializations);

// @route   GET /api/v1/provider/specialization/:specialization
// @desc    Get providers by specialization with pagination
// @access  Public
router.get('/specialization/:specialization', validateSpecialization, getProvidersBySpecialization);

// @route   GET /api/v1/provider/:id
// @desc    Get provider by ID
// @access  Public
router.get('/:id', getProviderById);

// @route   GET /api/v1/provider/check-email/:email
// @desc    Check if email already exists
// @access  Public
router.get('/check-email/:email', checkEmailExists);

// @route   GET /api/v1/provider/check-license/:license_number
// @desc    Check if license number already exists
// @access  Public
router.get('/check-license/:license_number', checkLicenseExists);

// @route   GET /api/v1/provider/stats
// @desc    Get provider statistics
// @access  Public
router.get('/stats', getProviderStats);

module.exports = router; 