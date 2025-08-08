const express = require('express');
const router = express.Router();

const {
  registerPatient,
  loginPatient,
  getPatientById,
  checkEmailExists,
  checkPhoneExists,
  getPatientsByAgeRange,
  getPatientsByGender,
  getPatientStats,
  getPatientsWithInsurance
} = require('../controllers/patientController');

const {
  validatePatientRegistration
} = require('../middleware/patientValidation');

const {
  validatePatientLogin
} = require('../middleware/loginValidation');

// @route   POST /api/v1/patient/register
// @desc    Register a new patient
// @access  Public
router.post('/register', validatePatientRegistration, registerPatient);

// @route   POST /api/v1/patient/login
// @desc    Login patient
// @access  Public
router.post('/login', validatePatientLogin, loginPatient);

// @route   GET /api/v1/patient/:id
// @desc    Get patient by ID
// @access  Public
router.get('/:id', getPatientById);

// @route   GET /api/v1/patient/check-email/:email
// @desc    Check if email already exists
// @access  Public
router.get('/check-email/:email', checkEmailExists);

// @route   GET /api/v1/patient/check-phone/:phone_number
// @desc    Check if phone number already exists
// @access  Public
router.get('/check-phone/:phone_number', checkPhoneExists);

// @route   GET /api/v1/patient/age-range
// @desc    Get patients by age range with pagination
// @access  Public
router.get('/age-range', getPatientsByAgeRange);

// @route   GET /api/v1/patient/gender/:gender
// @desc    Get patients by gender with pagination
// @access  Public
router.get('/gender/:gender', getPatientsByGender);

// @route   GET /api/v1/patient/stats
// @desc    Get patient statistics and analytics
// @access  Public
router.get('/stats', getPatientStats);

// @route   GET /api/v1/patient/with-insurance
// @desc    Get patients with insurance information
// @access  Public
router.get('/with-insurance', getPatientsWithInsurance);

module.exports = router; 