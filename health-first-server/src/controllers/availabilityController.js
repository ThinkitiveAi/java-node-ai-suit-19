const ProviderAvailability = require('../models/ProviderAvailability');
const AppointmentSlot = require('../models/AppointmentSlot');
const Provider = require('../models/Provider');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  generateRecurringDates, 
  isTimeOverlapping, 
  localToUTC,
  utcToLocal,
  getNextBusinessDay 
} = require('../utils/timezoneUtils');

/**
 * Create availability slots for a provider
 */
const createAvailability = asyncHandler(async (req, res, next) => {
  const providerId = req.user.provider_id || req.body.provider_id;
  const availabilityData = req.validatedData;

  // Check if provider exists and is verified
  const provider = await Provider.findById(providerId);
  if (!provider) {
    return res.status(404).json({
      error: 'Provider not found'
    });
  }

  if (provider.verification_status !== 'verified') {
    return res.status(403).json({
      error: 'Provider must be verified to create availability'
    });
  }

  // Check for overlapping availability
  const overlapping = await ProviderAvailability.findOverlapping(
    providerId,
    availabilityData.date,
    availabilityData.start_time,
    availabilityData.end_time
  );

  if (overlapping.length > 0) {
    return res.status(409).json({
      error: 'Time slot conflicts with existing availability',
      details: overlapping.map(avail => ({
        date: avail.date,
        start_time: avail.start_time,
        end_time: avail.end_time
      }))
    });
  }

  let createdAvailabilities = [];
  let totalSlotsCreated = 0;

  if (availabilityData.is_recurring) {
    // Generate recurring dates
    const dates = generateRecurringDates(
      availabilityData.date,
      availabilityData.recurrence_end_date,
      availabilityData.recurrence_pattern
    );

    // Create availability for each date
    for (const date of dates) {
      const availability = new ProviderAvailability({
        ...availabilityData,
        provider_id: providerId,
        date: date
      });

      const savedAvailability = await availability.save();
      createdAvailabilities.push(savedAvailability);

      // Generate appointment slots for this availability
      const slots = await AppointmentSlot.generateSlotsFromAvailability(savedAvailability);
      totalSlotsCreated += slots.length;
    }
  } else {
    // Create single availability
    const availability = new ProviderAvailability({
      ...availabilityData,
      provider_id: providerId
    });

    const savedAvailability = await availability.save();
    createdAvailabilities.push(savedAvailability);

    // Generate appointment slots
    const slots = await AppointmentSlot.generateSlotsFromAvailability(savedAvailability);
    totalSlotsCreated = slots.length;
  }

  res.status(201).json({
    success: true,
    message: 'Availability slots created successfully',
    data: {
      availability_id: createdAvailabilities[0]._id,
      slots_created: totalSlotsCreated,
      date_range: {
        start: availabilityData.date,
        end: availabilityData.is_recurring ? availabilityData.recurrence_end_date : availabilityData.date
      },
      total_appointments_available: totalSlotsCreated
    }
  });
});

/**
 * Get provider availability
 */
const getProviderAvailability = asyncHandler(async (req, res, next) => {
  const { provider_id } = req.params;
  const { start_date, end_date, status, appointment_type, timezone } = req.query;

  // Validate required query parameters
  if (!start_date || !end_date) {
    return res.status(400).json({
      error: 'Start date and end date are required'
    });
  }

  // Build query
  const query = {
    provider_id: provider_id,
    date: {
      $gte: start_date,
      $lte: end_date
    }
  };

  if (status) {
    query.status = status;
  }

  if (appointment_type) {
    query.appointment_type = appointment_type;
  }

  // Get availability
  const availability = await ProviderAvailability.find(query)
    .populate('provider_id', 'first_name last_name specialization')
    .sort({ date: 1, start_time: 1 });

  // Get appointment slots for the date range
  const slots = await AppointmentSlot.find({
    provider_id: provider_id,
    slot_start_time: {
      $gte: new Date(`${start_date}T00:00:00.000Z`),
      $lte: new Date(`${end_date}T23:59:59.999Z`)
    }
  }).sort({ slot_start_time: 1 });

  // Calculate summary statistics
  const totalSlots = slots.length;
  const availableSlots = slots.filter(slot => slot.status === 'available').length;
  const bookedSlots = slots.filter(slot => slot.status === 'booked').length;
  const cancelledSlots = slots.filter(slot => slot.status === 'cancelled').length;

  // Group availability by date
  const availabilityByDate = {};
  availability.forEach(avail => {
    if (!availabilityByDate[avail.date]) {
      availabilityByDate[avail.date] = [];
    }
    availabilityByDate[avail.date].push(avail);
  });

  // Group slots by date
  const slotsByDate = {};
  slots.forEach(slot => {
    const date = slot.slot_start_time.toISOString().split('T')[0];
    if (!slotsByDate[date]) {
      slotsByDate[date] = [];
    }
    slotsByDate[date].push(slot);
  });

  // Format response
  const formattedAvailability = Object.keys(availabilityByDate).map(date => {
    const dayAvailability = availabilityByDate[date];
    const daySlots = slotsByDate[date] || [];

    return {
      date: date,
      availability: dayAvailability.map(avail => ({
        availability_id: avail._id,
        start_time: avail.start_time,
        end_time: avail.end_time,
        status: avail.status,
        appointment_type: avail.appointment_type,
        location: avail.location,
        pricing: avail.pricing,
        special_requirements: avail.special_requirements,
        notes: avail.notes
      })),
      slots: daySlots.map(slot => ({
        slot_id: slot._id,
        start_time: slot.slot_start_time,
        end_time: slot.slot_end_time,
        status: slot.status,
        appointment_type: slot.appointment_type,
        booking_reference: slot.booking_reference
      }))
    };
  });

  res.json({
    success: true,
    data: {
      provider_id: provider_id,
      availability_summary: {
        total_slots: totalSlots,
        available_slots: availableSlots,
        booked_slots: bookedSlots,
        cancelled_slots: cancelledSlots
      },
      availability: formattedAvailability
    }
  });
});

/**
 * Update availability slot
 */
const updateAvailability = asyncHandler(async (req, res, next) => {
  const { slot_id } = req.params;
  const updateData = req.body;

  const availability = await ProviderAvailability.findById(slot_id);
  if (!availability) {
    return res.status(404).json({
      error: 'Availability slot not found'
    });
  }

  // Check if provider owns this availability
  if (req.user.provider_id && availability.provider_id.toString() !== req.user.provider_id) {
    return res.status(403).json({
      error: 'Access denied. You can only update your own availability'
    });
  }

  // Check for overlapping if time is being updated
  if (updateData.start_time || updateData.end_time) {
    const newStartTime = updateData.start_time || availability.start_time;
    const newEndTime = updateData.end_time || availability.end_time;

    const overlapping = await ProviderAvailability.findOverlapping(
      availability.provider_id,
      availability.date,
      newStartTime,
      newEndTime,
      slot_id
    );

    if (overlapping.length > 0) {
      return res.status(409).json({
        error: 'Updated time slot conflicts with existing availability'
      });
    }
  }

  // Update availability
  Object.assign(availability, updateData);
  await availability.save();

  res.json({
    success: true,
    message: 'Availability updated successfully',
    data: {
      availability_id: availability._id,
      date: availability.date,
      start_time: availability.start_time,
      end_time: availability.end_time,
      status: availability.status,
      notes: availability.notes,
      pricing: availability.pricing
    }
  });
});

/**
 * Delete availability slot
 */
const deleteAvailability = asyncHandler(async (req, res, next) => {
  const { slot_id } = req.params;
  const { delete_recurring, reason } = req.query;

  const availability = await ProviderAvailability.findById(slot_id);
  if (!availability) {
    return res.status(404).json({
      error: 'Availability slot not found'
    });
  }

  // Check if provider owns this availability
  if (req.user.provider_id && availability.provider_id.toString() !== req.user.provider_id) {
    return res.status(403).json({
      error: 'Access denied. You can only delete your own availability'
    });
  }

  // Check if there are any booked appointments
  const bookedSlots = await AppointmentSlot.find({
    availability_id: slot_id,
    status: 'booked'
  });

  if (bookedSlots.length > 0) {
    return res.status(400).json({
      error: 'Cannot delete availability with booked appointments',
      details: {
        booked_appointments: bookedSlots.length
      }
    });
  }

  if (delete_recurring === 'true' && availability.is_recurring) {
    // Delete all recurring instances
    const recurringAvailabilities = await ProviderAvailability.find({
      provider_id: availability.provider_id,
      is_recurring: true,
      recurrence_pattern: availability.recurrence_pattern,
      date: { $gte: availability.date }
    });

    for (const avail of recurringAvailabilities) {
      // Delete associated appointment slots
      await AppointmentSlot.deleteMany({ availability_id: avail._id });
      await avail.deleteOne();
    }

    res.json({
      success: true,
      message: 'Recurring availability deleted successfully',
      data: {
        deleted_count: recurringAvailabilities.length
      }
    });
  } else {
    // Delete single availability
    await AppointmentSlot.deleteMany({ availability_id: slot_id });
    await availability.deleteOne();

    res.json({
      success: true,
      message: 'Availability deleted successfully'
    });
  }
});

/**
 * Search for available slots
 */
const searchAvailableSlots = asyncHandler(async (req, res, next) => {
  const {
    date,
    start_date,
    end_date,
    specialization,
    location,
    appointment_type,
    insurance_accepted,
    max_price,
    timezone = 'America/New_York',
    available_only = 'true'
  } = req.query;

  // Build search query
  const searchQuery = {
    status: 'available'
  };

  // Date filtering
  if (date) {
    searchQuery.date = date;
  } else if (start_date && end_date) {
    searchQuery.date = {
      $gte: start_date,
      $lte: end_date
    };
  } else {
    // Default to next 30 days if no date specified
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    searchQuery.date = {
      $gte: today.toISOString().split('T')[0],
      $lte: thirtyDaysFromNow.toISOString().split('T')[0]
    };
  }

  // Specialization filtering
  if (specialization) {
    // First get providers with this specialization
    const providers = await Provider.find({
      specialization: { $regex: specialization, $options: 'i' },
      verification_status: 'verified',
      is_active: true
    }).select('_id');
    
    const providerIds = providers.map(p => p._id);
    searchQuery.provider_id = { $in: providerIds };
  }

  // Location filtering
  if (location) {
    const locationParts = location.split(',').map(part => part.trim());
    if (locationParts.length >= 2) {
      searchQuery['location.city'] = { $regex: locationParts[0], $options: 'i' };
      searchQuery['location.state'] = { $regex: locationParts[1], $options: 'i' };
    } else {
      searchQuery['location.city'] = { $regex: location, $options: 'i' };
    }
  }

  // Appointment type filtering
  if (appointment_type) {
    searchQuery.appointment_type = appointment_type;
  }

  // Insurance filtering
  if (insurance_accepted === 'true') {
    searchQuery['pricing.insurance_accepted'] = true;
  }

  // Price filtering
  if (max_price) {
    searchQuery['pricing.base_fee'] = { $lte: parseFloat(max_price) };
  }

  // Get availability
  const availability = await ProviderAvailability.find(searchQuery)
    .populate('provider_id', 'first_name last_name specialization years_of_experience clinic_address')
    .sort({ date: 1, start_time: 1 });

  // Get appointment slots for the availability
  const availabilityIds = availability.map(avail => avail._id);
  const slots = await AppointmentSlot.find({
    availability_id: { $in: availabilityIds },
    status: available_only === 'true' ? 'available' : { $in: ['available', 'booked'] }
  }).sort({ slot_start_time: 1 });

  // Group results by provider
  const resultsByProvider = {};
  
  availability.forEach(avail => {
    const providerId = avail.provider_id._id.toString();
    if (!resultsByProvider[providerId]) {
      resultsByProvider[providerId] = {
        provider: {
          id: avail.provider_id._id,
          name: `${avail.provider_id.first_name} ${avail.provider_id.last_name}`,
          specialization: avail.provider_id.specialization,
          years_of_experience: avail.provider_id.years_of_experience,
          clinic_address: avail.provider_id.clinic_address
        },
        available_slots: []
      };
    }

    // Get slots for this availability
    const availabilitySlots = slots.filter(slot => 
      slot.availability_id.toString() === avail._id.toString()
    );

    availabilitySlots.forEach(slot => {
      const localTime = utcToLocal(slot.slot_start_time, timezone);
      
      resultsByProvider[providerId].available_slots.push({
        slot_id: slot._id,
        date: localTime.date,
        start_time: localTime.time,
        end_time: utcToLocal(slot.slot_end_time, timezone).time,
        appointment_type: slot.appointment_type,
        location: avail.location,
        pricing: avail.pricing,
        special_requirements: avail.special_requirements
      });
    });
  });

  const results = Object.values(resultsByProvider);

  res.json({
    success: true,
    data: {
      search_criteria: {
        date: date || `${start_date} to ${end_date}`,
        specialization: specialization || 'all',
        location: location || 'all'
      },
      total_results: results.length,
      results: results
    }
  });
});

/**
 * Get availability statistics
 */
const getAvailabilityStats = asyncHandler(async (req, res, next) => {
  const { provider_id } = req.params;
  const { start_date, end_date } = req.query;

  const query = { provider_id };
  if (start_date && end_date) {
    query.date = { $gte: start_date, $lte: end_date };
  }

  const availability = await ProviderAvailability.find(query);
  const slots = await AppointmentSlot.find({
    provider_id,
    slot_start_time: start_date && end_date ? {
      $gte: new Date(`${start_date}T00:00:00.000Z`),
      $lte: new Date(`${end_date}T23:59:59.999Z`)
    } : {}
  });

  const stats = {
    total_availability_blocks: availability.length,
    total_slots: slots.length,
    available_slots: slots.filter(s => s.status === 'available').length,
    booked_slots: slots.filter(s => s.status === 'booked').length,
    cancelled_slots: slots.filter(s => s.status === 'cancelled').length,
    completed_slots: slots.filter(s => s.status === 'completed').length,
    no_show_slots: slots.filter(s => s.status === 'no_show').length,
    utilization_rate: slots.length > 0 ? 
      ((slots.filter(s => s.status === 'booked').length / slots.length) * 100).toFixed(2) : 0
  };

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  createAvailability,
  getProviderAvailability,
  updateAvailability,
  deleteAvailability,
  searchAvailableSlots,
  getAvailabilityStats
}; 