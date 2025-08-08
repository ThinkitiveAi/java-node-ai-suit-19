const mongoose = require('mongoose');

// Location schema
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Location type is required'],
    enum: {
      values: ['clinic', 'hospital', 'office', 'virtual', 'home_visit'],
      message: 'Location type must be one of: clinic, hospital, office, virtual, home_visit'
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  room_number: {
    type: String,
    trim: true,
    maxlength: [50, 'Room number cannot exceed 50 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  zip: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{5}$/.test(v);
      },
      message: 'ZIP code must be a valid 5-digit US format'
    }
  }
}, { _id: false });

// Pricing schema
const pricingSchema = new mongoose.Schema({
  base_fee: {
    type: Number,
    required: [true, 'Base fee is required'],
    min: [0, 'Base fee cannot be negative'],
    max: [10000, 'Base fee cannot exceed $10,000']
  },
  insurance_accepted: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: {
      values: ['USD', 'EUR', 'GBP', 'CAD'],
      message: 'Currency must be one of: USD, EUR, GBP, CAD'
    }
  },
  copay: {
    type: Number,
    min: [0, 'Copay cannot be negative'],
    default: 0
  },
  deductible_applies: {
    type: Boolean,
    default: true
  }
}, { _id: false });

// Main provider availability schema
const providerAvailabilitySchema = new mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: [true, 'Provider ID is required'],
    index: true
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        // Validate date format YYYY-MM-DD
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        // Validate time format HH:mm
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:mm format'
    }
  },
  end_time: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        // Validate time format HH:mm
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:mm format'
    }
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    validate: {
      validator: function(v) {
        // Basic timezone validation (moment-timezone will handle detailed validation)
        const validTimezones = [
          'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
          'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'UTC',
          'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
        ];
        return validTimezones.includes(v) || /^[A-Za-z_]+\/[A-Za-z_]+$/.test(v);
      },
      message: 'Please provide a valid timezone'
    }
  },
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurrence_pattern: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'monthly'],
      message: 'Recurrence pattern must be one of: daily, weekly, monthly'
    },
    required: function() {
      return this.is_recurring === true;
    }
  },
  recurrence_end_date: {
    type: String,
    validate: {
      validator: function(v) {
        if (!this.is_recurring) return true;
        if (!v) return false;
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Recurrence end date is required for recurring availability and must be in YYYY-MM-DD format'
    }
  },
  slot_duration: {
    type: Number,
    required: [true, 'Slot duration is required'],
    min: [15, 'Slot duration must be at least 15 minutes'],
    max: [240, 'Slot duration cannot exceed 4 hours'],
    validate: {
      validator: function(v) {
        return v % 15 === 0; // Must be divisible by 15 minutes
      },
      message: 'Slot duration must be divisible by 15 minutes'
    }
  },
  break_duration: {
    type: Number,
    default: 0,
    min: [0, 'Break duration cannot be negative'],
    max: [60, 'Break duration cannot exceed 60 minutes'],
    validate: {
      validator: function(v) {
        return v % 5 === 0; // Must be divisible by 5 minutes
      },
      message: 'Break duration must be divisible by 5 minutes'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'unavailable', 'cancelled'],
      message: 'Status must be one of: available, unavailable, cancelled'
    },
    default: 'available'
  },
  max_appointments_per_slot: {
    type: Number,
    default: 1,
    min: [1, 'Max appointments per slot must be at least 1'],
    max: [10, 'Max appointments per slot cannot exceed 10']
  },
  current_appointments: {
    type: Number,
    default: 0,
    min: [0, 'Current appointments cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.max_appointments_per_slot;
      },
      message: 'Current appointments cannot exceed max appointments per slot'
    }
  },
  appointment_type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_consultation'],
      message: 'Appointment type must be one of: consultation, follow_up, emergency, routine_checkup, specialist_consultation'
    }
  },
  location: {
    type: locationSchema,
    required: [true, 'Location is required']
  },
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  special_requirements: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        const validRequirements = [
          'fasting_required', 'bring_insurance_card', 'bring_medical_records',
          'wear_comfortable_clothing', 'arrive_early', 'bring_medication_list',
          'no_food_before', 'bring_photo_id', 'companion_allowed'
        ];
        return v.every(req => validRequirements.includes(req));
      },
      message: 'Special requirements must be from the predefined list'
    }
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
providerAvailabilitySchema.index({ provider_id: 1, date: 1 });
providerAvailabilitySchema.index({ date: 1, status: 1 });
providerAvailabilitySchema.index({ provider_id: 1, status: 1 });
providerAvailabilitySchema.index({ 'location.city': 1, 'location.state': 1 });
providerAvailabilitySchema.index({ appointment_type: 1 });
providerAvailabilitySchema.index({ is_recurring: 1 });

// Pre-save middleware to validate time logic
providerAvailabilitySchema.pre('save', function(next) {
  // Convert times to minutes for comparison
  const startMinutes = this.start_time.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0);
  const endMinutes = this.end_time.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0);
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  // Check if slot duration fits within the time range
  const totalMinutes = endMinutes - startMinutes;
  const totalSlots = Math.floor(totalMinutes / (this.slot_duration + this.break_duration));
  
  if (totalSlots < 1) {
    return next(new Error('Time range must accommodate at least one slot'));
  }
  
  next();
});

// Instance method to check if slot is available
providerAvailabilitySchema.methods.isSlotAvailable = function() {
  return this.status === 'available' && this.current_appointments < this.max_appointments_per_slot;
};

// Instance method to get available slots count
providerAvailabilitySchema.methods.getAvailableSlotsCount = function() {
  const totalMinutes = this.getTotalMinutes();
  const slotWithBreak = this.slot_duration + this.break_duration;
  const totalSlots = Math.floor(totalMinutes / slotWithBreak);
  return totalSlots - this.current_appointments;
};

// Instance method to get total minutes
providerAvailabilitySchema.methods.getTotalMinutes = function() {
  const startMinutes = this.start_time.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0);
  const endMinutes = this.end_time.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0);
  return endMinutes - startMinutes;
};

// Static method to find overlapping availability
providerAvailabilitySchema.statics.findOverlapping = function(providerId, date, startTime, endTime, excludeId = null) {
  const query = {
    provider_id: providerId,
    date: date,
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
            start_time: { $lte: startTime },
            end_time: { $gt: startTime }
          },
          // New slot ends during existing slot
          {
            start_time: { $lt: endTime },
            end_time: { $gte: endTime }
          },
          // New slot completely contains existing slot
          {
            start_time: { $gte: startTime },
            end_time: { $lte: endTime }
          }
        ]
      }
    ]
  });
};

const ProviderAvailability = mongoose.model('ProviderAvailability', providerAvailabilitySchema, 'provider_availability');

module.exports = ProviderAvailability; 