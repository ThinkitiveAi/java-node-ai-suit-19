const Joi = require('joi');
const Patient = require('../models/Patient');

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

// Patient registration validation schema
const patientRegistrationSchema = Joi.object({
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

  date_of_birth: Joi.date()
    .max('now')
    .required()
    .custom((value, helpers) => {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 13) {
        return helpers.error('any.invalid', { message: 'Patient must be at least 13 years old' });
      }
      
      return value;
    })
    .messages({
      'date.max': 'Date of birth must be in the past',
      'any.required': 'Date of birth is required',
      'any.invalid': 'Patient must be at least 13 years old'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other', 'prefer_not_to_say')
    .required()
    .messages({
      'any.only': 'Gender must be one of: male, female, other, prefer_not_to_say',
      'any.required': 'Gender is required',
      'string.empty': 'Gender cannot be empty'
    }),

  address: Joi.object({
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
    'any.required': 'Address is required',
    'object.base': 'Address must be an object'
  }),

  emergency_contact: Joi.object({
    name: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Emergency contact name cannot exceed 100 characters',
        'any.required': 'Emergency contact name is required',
        'string.empty': 'Emergency contact name cannot be empty'
      }),

    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]+$/)
      .min(10)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid international phone number',
        'string.min': 'Phone number must be at least 10 digits',
        'any.required': 'Emergency contact phone is required',
        'string.empty': 'Emergency contact phone cannot be empty'
      }),

    relationship: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'Relationship cannot exceed 50 characters',
        'any.required': 'Emergency contact relationship is required',
        'string.empty': 'Emergency contact relationship cannot be empty'
      })
  }).optional().messages({
    'object.base': 'Emergency contact must be an object'
  }),

  medical_history: Joi.array()
    .items(Joi.string().min(1))
    .optional()
    .default([])
    .messages({
      'array.base': 'Medical history must be an array',
      'array.items': 'Medical history items must be non-empty strings'
    }),

  insurance_info: Joi.object({
    provider: Joi.string()
      .required()
      .messages({
        'any.required': 'Insurance provider is required',
        'string.empty': 'Insurance provider cannot be empty'
      }),

    policy_number: Joi.string()
      .required()
      .messages({
        'any.required': 'Policy number is required',
        'string.empty': 'Policy number cannot be empty'
      })
  }).optional().messages({
    'object.base': 'Insurance info must be an object'
  })
});

// Validation middleware
const validatePatientRegistration = async (req, res, next) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Validate input
    const { error, value } = patientRegistrationSchema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: false
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
    const existingEmail = await Patient.findOne({ email: value.email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered',
        field: 'email'
      });
    }

    // Check for existing phone number
    const existingPhone = await Patient.findOne({ phone_number: value.phone_number });
    if (existingPhone) {
      return res.status(409).json({
        error: 'Phone number already registered',
        field: 'phone_number'
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

module.exports = {
  validatePatientRegistration,
  sanitizeInput
}; 