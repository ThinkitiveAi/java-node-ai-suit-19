const express = require('express');
const router = express.Router();
const { validateAvailability } = require('../middleware/availabilityValidation');
const { authenticateToken, authorizeRoles } = require('../middleware/authentication');
const {
  createAvailability,
  getProviderAvailability,
  updateAvailability,
  deleteAvailability,
  searchAvailableSlots,
  getAvailabilityStats
} = require('../controllers/availabilityController');

/**
 * @route   POST /api/v1/provider/availability
 * @desc    Create availability slots for a provider
 * @access  Private (Provider)
 */
router.post('/provider/availability', 
  authenticateToken, 
  authorizeRoles(['provider']), 
  validateAvailability, 
  createAvailability
);

/**
 * @route   GET /api/v1/provider/:provider_id/availability
 * @desc    Get provider availability
 * @access  Public
 */
router.get('/provider/:provider_id/availability', getProviderAvailability);

/**
 * @route   PUT /api/v1/provider/availability/:slot_id
 * @desc    Update availability slot
 * @access  Private (Provider)
 */
router.put('/provider/availability/:slot_id', 
  authenticateToken, 
  authorizeRoles(['provider']), 
  updateAvailability
);

/**
 * @route   DELETE /api/v1/provider/availability/:slot_id
 * @desc    Delete availability slot
 * @access  Private (Provider)
 */
router.delete('/provider/availability/:slot_id', 
  authenticateToken, 
  authorizeRoles(['provider']), 
  deleteAvailability
);

/**
 * @route   GET /api/v1/availability/search
 * @desc    Search for available slots
 * @access  Public
 */
router.get('/availability/search', searchAvailableSlots);

/**
 * @route   GET /api/v1/provider/:provider_id/availability/stats
 * @desc    Get availability statistics
 * @access  Private (Provider)
 */
router.get('/provider/:provider_id/availability/stats', 
  authenticateToken, 
  authorizeRoles(['provider']), 
  getAvailabilityStats
);

module.exports = router; 