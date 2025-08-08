const Joi = require('joi');

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

// Patient login validation schema
const patientLoginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    })
});

// Validation middleware
const validatePatientLogin = (req, res, next) => {
  try {
    // Sanitize input
    const sanitizedData = sanitizeInput(req.body);
    
    // Validate input
    const { error, value } = patientLoginSchema.validate(sanitizedData, {
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

    // Store validated and sanitized data
    req.validatedData = value;
    next();
  } catch (error) {
    console.error('Login validation error:', error);
    return res.status(500).json({
      error: 'Internal server error during validation'
    });
  }
};

module.exports = {
  validatePatientLogin,
  sanitizeInput
}; 