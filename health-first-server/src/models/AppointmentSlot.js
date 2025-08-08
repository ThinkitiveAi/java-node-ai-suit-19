const mongoose = require('mongoose');

const appointmentSlotSchema = new mongoose.Schema({
  availability_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderAvailability',
    required: [true, 'Availability ID is required'],
    index: true
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required'],
    index: true
  },
  slot_start_time: {
    type: Date,
    required: [true, 'Slot start time is required'],
    index: true
  },
  slot_end_time: {
    type: Date,
    required: [true, 'Slot end time is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'booked', 'cancelled', 'completed', 'no_show'],
      message: 'Status must be one of: available, booked, cancelled, completed, no_show'
    },
    default: 'available',
    index: true
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null,
    index: true
  },
  appointment_type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_consultation'],
      message: 'Appointment type must be one of: consultation, follow_up, emergency, routine_checkup, specialist_consultation'
    }
  },
  booking_reference: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/undefined
        return /^[A-Z0-9]{8,12}$/.test(v);
      },
      message: 'Booking reference must be 8-12 characters of uppercase letters and numbers'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  cancellation_reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
appointmentSlotSchema.index({ provider_id: 1, slot_start_time: 1 });
appointmentSlotSchema.index({ patient_id: 1, slot_start_time: 1 });
appointmentSlotSchema.index({ status: 1, slot_start_time: 1 });
appointmentSlotSchema.index({ appointment_type: 1 });
appointmentSlotSchema.index({ booking_reference: 1 });

// Pre-save middleware to validate time logic
appointmentSlotSchema.pre('save', function(next) {
  if (this.slot_end_time <= this.slot_start_time) {
    return next(new Error('Slot end time must be after start time'));
  }
  
  // Update the updated_at field
  this.updated_at = new Date();
  next();
});

// Pre-save middleware to generate booking reference
appointmentSlotSchema.pre('save', function(next) {
  if (this.status === 'booked' && !this.booking_reference) {
    // Generate a unique booking reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.booking_reference = `${timestamp}${random}`;
  }
  next();
});

// Instance method to check if slot is available
appointmentSlotSchema.methods.isAvailable = function() {
  return this.status === 'available' && !this.patient_id;
};

// Instance method to book slot
appointmentSlotSchema.methods.bookSlot = function(patientId, appointmentType, notes = '') {
  if (!this.isAvailable()) {
    throw new Error('Slot is not available for booking');
  }
  
  this.patient_id = patientId;
  this.appointment_type = appointmentType;
  this.status = 'booked';
  this.notes = notes;
  this.updated_at = new Date();
  
  return this.save();
};

// Instance method to cancel slot
appointmentSlotSchema.methods.cancelSlot = function(reason = '') {
  if (this.status === 'cancelled') {
    throw new Error('Slot is already cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellation_reason = reason;
  this.patient_id = null;
  this.booking_reference = null;
  this.updated_at = new Date();
  
  return this.save();
};

// Instance method to complete slot
appointmentSlotSchema.methods.completeSlot = function() {
  if (this.status !== 'booked') {
    throw new Error('Only booked slots can be completed');
  }
  
  this.status = 'completed';
  this.updated_at = new Date();
  
  return this.save();
};

// Static method to find available slots
appointmentSlotSchema.statics.findAvailableSlots = function(providerId, startDate, endDate, appointmentType = null) {
  const query = {
    provider_id: providerId,
    status: 'available',
    slot_start_time: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (appointmentType) {
    query.appointment_type = appointmentType;
  }
  
  return this.find(query).sort({ slot_start_time: 1 });
};

// Static method to find overlapping slots
appointmentSlotSchema.statics.findOverlapping = function(providerId, startTime, endTime, excludeId = null) {
  const query = {
    provider_id: providerId,
    status: { $ne: 'cancelled' }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find({
    $and: [
      query,
      {
        $or: [
          // New slot starts during existing slot
          {
            slot_start_time: { $lte: startTime },
            slot_end_time: { $gt: startTime }
          },
          // New slot ends during existing slot
          {
            slot_start_time: { $lt: endTime },
            slot_end_time: { $gte: endTime }
          },
          // New slot completely contains existing slot
          {
            slot_start_time: { $gte: startTime },
            slot_end_time: { $lte: endTime }
          }
        ]
      }
    ]
  });
};

// Static method to generate slots from availability
appointmentSlotSchema.statics.generateSlotsFromAvailability = async function(availability) {
  const slots = [];
  const startDate = new Date(`${availability.date}T${availability.start_time}:00`);
  const endDate = new Date(`${availability.date}T${availability.end_time}:00`);
  
  let currentTime = new Date(startDate);
  const slotDuration = availability.slot_duration * 60 * 1000; // Convert to milliseconds
  const breakDuration = availability.break_duration * 60 * 1000; // Convert to milliseconds
  
  while (currentTime < endDate) {
    const slotEndTime = new Date(currentTime.getTime() + slotDuration);
    
    if (slotEndTime <= endDate) {
      const slot = new this({
        availability_id: availability._id,
        provider_id: availability.provider_id,
        slot_start_time: currentTime,
        slot_end_time: slotEndTime,
        appointment_type: availability.appointment_type,
        status: 'available'
      });
      
      slots.push(slot);
    }
    
    // Move to next slot (including break)
    currentTime = new Date(currentTime.getTime() + slotDuration + breakDuration);
  }
  
  return this.insertMany(slots);
};

const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema, 'appointment_slots');

module.exports = AppointmentSlot; 