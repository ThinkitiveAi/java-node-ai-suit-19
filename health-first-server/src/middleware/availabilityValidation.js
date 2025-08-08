const Joi = require('joi');
const { isValidTimezone, isDateInPast, isTimeOverlapping } = require('../utils/timezoneUtils');

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

// Provider availability validation schema
const availabilitySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom((value, helpers) => {
      if (isDateInPast(value)) {
        return helpers.error('any.invalid', { message: 'Date cannot be in the past' });
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Date is required',
      'any.invalid': 'Date cannot be in the past'
    }),

  start_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:mm format',
      'any.required': 'Start time is required'
    }),

  end_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:mm format',
      'any.required': 'End time is required'
    }),

  timezone: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidTimezone(value)) {
        return helpers.error('any.invalid', { message: 'Invalid timezone' });
      }
      return value;
    })
    .messages({
      'any.required': 'Timezone is required',
      'any.invalid': 'Please provide a valid timezone'
    }),

  slot_duration: Joi.number()
    .integer()
    .min(15)
    .max(240)
    .required()
    .custom((value, helpers) => {
      if (value % 15 !== 0) {
        return helpers.error('any.invalid', { message: 'Slot duration must be divisible by 15 minutes' });
      }
      return value;
    })
    .messages({
      'number.base': 'Slot duration must be a number',
      'number.integer': 'Slot duration must be a whole number',
      'number.min': 'Slot duration must be at least 15 minutes',
      'number.max': 'Slot duration cannot exceed 4 hours',
      'any.invalid': 'Slot duration must be divisible by 15 minutes',
      'any.required': 'Slot duration is required'
    }),

  break_duration: Joi.number()
    .integer()
    .min(0)
    .max(60)
    .default(0)
    .custom((value, helpers) => {
      if (value % 5 !== 0) {
        return helpers.error('any.invalid', { message: 'Break duration must be divisible by 5 minutes' });
      }
      return value;
    })
    .messages({
      'number.base': 'Break duration must be a number',
      'number.integer': 'Break duration must be a whole number',
      'number.min': 'Break duration cannot be negative',
      'number.max': 'Break duration cannot exceed 60 minutes',
      'any.invalid': 'Break duration must be divisible by 5 minutes'
    }),

  is_recurring: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Is recurring must be a boolean'
    }),

  recurrence_pattern: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .when('is_recurring', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': 'Recurrence pattern must be one of: daily, weekly, monthly',
      'any.required': 'Recurrence pattern is required when is_recurring is true'
    }),

  recurrence_end_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .when('is_recurring', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .custom((value, helpers) => {
      const { date } = helpers.state.ancestors[0];
      if (value && date && value <= date) {
        return helpers.error('any.invalid', { message: 'Recurrence end date must be after start date' });
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'Recurrence end date must be in YYYY-MM-DD format',
      'any.required': 'Recurrence end date is required when is_recurring is true',
      'any.invalid': 'Recurrence end date must be after start date'
    }),

  appointment_type: Joi.string()
    .valid('consultation', 'follow_up', 'emergency', 'routine_checkup', 'specialist_consultation')
    .required()
    .messages({
      'any.only': 'Appointment type must be one of: consultation, follow_up, emergency, routine_checkup, specialist_consultation',
      'any.required': 'Appointment type is required'
    }),

  location: Joi.object({
    type: Joi.string()
      .valid('clinic', 'hospital', 'office', 'virtual', 'home_visit')
      .required()
      .messages({
        'any.only': 'Location type must be one of: clinic, hospital, office, virtual, home_visit',
        'any.required': 'Location type is required'
      }),

    address: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Address cannot exceed 500 characters',
        'any.required': 'Address is required',
        'string.empty': 'Address cannot be empty'
      }),

    room_number: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Room number cannot exceed 50 characters'
      }),

    city: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'City name cannot exceed 100 characters',
        'any.required': 'City is required',
        'string.empty': 'City cannot be empty'
      }),

    state: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'State name cannot exceed 50 characters',
        'any.required': 'State is required',
        'string.empty': 'State cannot be empty'
      }),

    zip: Joi.string()
      .pattern(/^\d{5}$/)
      .required()
      .messages({
        'string.pattern.base': 'ZIP code must be a valid 5-digit US format',
        'any.required': 'ZIP code is required',
        'string.empty': 'ZIP code cannot be empty'
      })
  }).required().messages({
    'any.required': 'Location is required',
    'object.base': 'Location must be an object'
  }),

  pricing: Joi.object({
    base_fee: Joi.number()
      .min(0)
      .max(10000)
      .required()
      .messages({
        'number.base': 'Base fee must be a number',
        'number.min': 'Base fee cannot be negative',
        'number.max': 'Base fee cannot exceed $10,000',
        'any.required': 'Base fee is required'
      }),

    insurance_accepted: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Insurance accepted must be a boolean'
      }),

    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'CAD')
      .default('USD')
      .messages({
        'any.only': 'Currency must be one of: USD, EUR, GBP, CAD'
      }),

    copay: Joi.number()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'Copay must be a number',
        'number.min': 'Copay cannot be negative'
      }),

    deductible_applies: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': 'Deductible applies must be a boolean'
      })
  }).required().messages({
    'any.required': 'Pricing is required',
    'object.base': 'Pricing must be an object'
  }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),

  special_requirements: Joi.array()
    .items(Joi.string().valid(
      'fasting_required', 'bring_insurance_card', 'bring_medical_records',
      'wear_comfortable_clothing', 'arrive_early', 'bring_medication_list',
      'no_food_before', 'bring_photo_id', 'companion_allowed'
    ))
    .default([])
    .messages({
      'array.base': 'Special requirements must be an array',
      'array.items': 'Special requirements must be from the predefined list'
    }),

  max_appointments_per_slot: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(1)
    .messages({
      'number.base': 'Max appointments per slot must be a number',
      'number.integer': 'Max appointments per slot must be a whole number',
      'number.min': 'Max appointments per slot must be at least 1',
      'number.max': 'Max appointments per slot cannot exceed 10'
    })
});

// Validation middleware
const validateAvailability = async (req, res, next) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Validate input
    const { error, value } = availabilitySchema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Additional validation: check if end time is after start time
    if (value.end_time <= value.start_time) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{
          field: 'end_time',
          message: 'End time must be after start time'
        }]
      });
    }

    // Store validated and sanitized data
    req.validatedData = value;
    next();
  } catch (error) {
    console.error('Availability validation error:', error);
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
};

module.exports = {
  validateAvailability,
  sanitizeInput
}; 