const Joi = require('joi');
const Provider = require('../models/Provider');

// Input sanitization function
const sanitizeInput = (input) => {
	if (typeof input === 'string') {
		return input.trim().replace(/[<>]/g, '');
	}
	if (Array.isArray(input)) {
		return input.map(sanitizeInput);
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

// Provider registration validation schema
const providerRegistrationSchema = Joi.object({
  first_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'First name is required',
      'string.empty': 'First name cannot be empty'
    }),

  last_name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Last name is required',
      'string.empty': 'Last name cannot be empty'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),

  phone_number: Joi.string()
    .pattern(/^\+?[\d\s\-\(\)]+$/)
    .min(10)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid international phone number',
      'string.min': 'Phone number must be at least 10 digits',
      'any.required': 'Phone number is required',
      'string.empty': 'Phone number cannot be empty'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    }),

  confirm_password: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Password confirmation is required',
      'string.empty': 'Password confirmation cannot be empty'
    }),

  specialization: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Specialization must be at least 3 characters long',
      'string.max': 'Specialization cannot exceed 100 characters',
      'any.required': 'Specialization is required',
      'string.empty': 'Specialization cannot be empty'
    }),

  license_number: Joi.string()
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'License number must contain only letters and numbers',
      'any.required': 'License number is required',
      'string.empty': 'License number cannot be empty'
    }),

  years_of_experience: Joi.number()
    .integer()
    .min(0)
    .max(50)
    .default(0)
    .messages({
      'number.base': 'Years of experience must be a number',
      'number.integer': 'Years of experience must be a whole number',
      'number.min': 'Years of experience cannot be negative',
      'number.max': 'Years of experience cannot exceed 50'
    }),

  clinic_address: Joi.object({
    street: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Street address cannot exceed 200 characters',
        'any.required': 'Street address is required',
        'string.empty': 'Street address cannot be empty'
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
    'any.required': 'Clinic address is required',
    'object.base': 'Clinic address must be an object'
  })
});

// Validation middleware
const validateProviderRegistration = async (req, res, next) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Validate input
    const { error, value } = providerRegistrationSchema.validate(sanitizedData, {
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

    // Check for existing email
    const existingEmail = await Provider.findOne({ email: value.email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered',
        field: 'email'
      });
    }

    // Check for existing phone number
    const existingPhone = await Provider.findOne({ phone_number: value.phone_number });
    if (existingPhone) {
      return res.status(409).json({
        error: 'Phone number already registered',
        field: 'phone_number'
      });
    }

    // Check for existing license number
    const existingLicense = await Provider.findOne({ license_number: value.license_number });
    if (existingLicense) {
      return res.status(409).json({
        error: 'License number already registered',
        field: 'license_number'
      });
    }

    // Store validated and sanitized data
    req.validatedData = value;
    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
};

// Get specializations validation
const validateSpecialization = (req, res, next) => {
  const { specialization } = req.params;
  
  if (!specialization) {
    return res.status(400).json({
      error: 'Specialization parameter is required'
    });
  }

  const specializations = Provider.getSpecializations();
  if (!specializations.includes(specialization)) {
    return res.status(400).json({
      error: 'Invalid specialization',
      validSpecializations: specializations
    });
  }

  next();
};

module.exports = {
  validateProviderRegistration,
  validateSpecialization,
  sanitizeInput
}; 