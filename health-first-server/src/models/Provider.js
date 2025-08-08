const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Specialization options
const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Internal Medicine',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Urology',
  'Emergency Medicine',
  'Anesthesiology',
  'Pathology',
  'Physical Medicine and Rehabilitation'
];

// Clinic address schema
const clinicAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
    maxlength: [200, 'Street address cannot exceed 200 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Street address cannot be empty'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'City cannot be empty'
    }
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'State cannot be empty'
    }
  },
  zip: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // US 5-digit ZIP code format
        return /^\d{5}$/.test(v);
      },
      message: 'ZIP code must be a valid 5-digit US format'
    }
  }
}, { _id: false });

// Main provider schema
const providerSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        // Only allow letters, spaces, hyphens, and apostrophes
        return /^[a-zA-Z\s\-']+$/.test(v);
      },
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        // Only allow letters, spaces, hyphens, and apostrophes
        return /^[a-zA-Z\s\-']+$/.test(v);
      },
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  phone_number: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // International phone number format (allows +, digits, spaces, hyphens, parentheses)
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(v) && v.replace(/[\s\-\(\)]/g, '').length >= 10;
      },
      message: 'Please provide a valid international phone number'
    }
  },
  password_hash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    minlength: [3, 'Specialization must be at least 3 characters long'],
    maxlength: [100, 'Specialization cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        // Allow custom specializations or from predefined list
        return v && v.trim().length >= 3;
      },
      message: 'Specialization must be at least 3 characters long'
    }
  },
  license_number: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Alphanumeric validation
        return /^[a-zA-Z0-9]+$/.test(v);
      },
      message: 'License number must contain only letters and numbers'
    }
  },
  years_of_experience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience cannot exceed 50'],
    default: 0,
    validate: {
      validator: function(v) {
        return Number.isInteger(v);
      },
      message: 'Years of experience must be a whole number'
    }
  },
  clinic_address: {
    type: clinicAddressSchema,
    required: [true, 'Clinic address is required']
  },
  verification_status: {
    type: String,
    enum: {
      values: ['pending', 'verified', 'rejected'],
      message: 'Verification status must be pending, verified, or rejected'
    },
    default: 'pending'
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    transform: function(doc, ret) {
      // Remove password_hash from JSON responses
      delete ret.password_hash;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Remove password_hash from object responses
      delete ret.password_hash;
      return ret;
    }
  }
});

// Indexes for performance and uniqueness
providerSchema.index({ email: 1 }, { unique: true });
providerSchema.index({ phone_number: 1 }, { unique: true });
providerSchema.index({ license_number: 1 }, { unique: true });
providerSchema.index({ verification_status: 1 });
providerSchema.index({ is_active: 1 });

// Pre-save middleware to hash password
providerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password_hash')) {
    return next();
  }

  try {
    // Hash password with 12 salt rounds
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
providerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static method to get specializations
providerSchema.statics.getSpecializations = function() {
  return SPECIALIZATIONS;
};

// Static method to validate specialization
providerSchema.statics.isValidSpecialization = function(specialization) {
  return SPECIALIZATIONS.includes(specialization);
};

// Virtual for full name
providerSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtual fields are serialized
providerSchema.set('toJSON', { virtuals: true });
providerSchema.set('toObject', { virtuals: true });

const Provider = mongoose.model('Provider', providerSchema, 'providers');

module.exports = Provider; 