const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authentication');
const { bookAppointment, listAppointments } = require('../controllers/appointmentController');

// Book appointment (patients only)
// POST /api/v1/appointments/book
router.post('/appointments/book', authenticateToken, authorizeRoles(['patient']), bookAppointment);

// List appointments for current user (patient or provider)
// GET /api/v1/appointments
router.get('/appointments', authenticateToken, listAppointments);

module.exports = router; 