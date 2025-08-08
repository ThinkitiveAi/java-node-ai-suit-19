const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Address schema
const addressSchema = new mongoose.Schema({
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

// Emergency contact schema
const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Emergency contact name is required'],
    trim: true,
    maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Emergency contact name cannot be empty'
    }
  },
  phone: {
    type: String,
    required: [true, 'Emergency contact phone is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // International phone number format
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        return phoneRegex.test(v) && v.replace(/[\s\-\(\)]/g, '').length >= 10;
      },
      message: 'Please provide a valid international phone number'
    }
  },
  relationship: {
    type: String,
    required: [true, 'Emergency contact relationship is required'],
    trim: true,
    maxlength: [50, 'Relationship cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Relationship cannot be empty'
    }
  }
}, { _id: false });

// Insurance info schema
const insuranceInfoSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: [true, 'Insurance provider is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Insurance provider cannot be empty'
    }
  },
  policy_number: {
    type: String,
    required: [true, 'Policy number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.trim().length > 0;
      },
      message: 'Policy number cannot be empty'
    }
  }
}, { _id: false });

// Main patient schema
const patientSchema = new mongoose.Schema({
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
        // International phone number format
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
  date_of_birth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(v) {
        // Must be in the past
        if (v >= new Date()) {
          return false;
        }
        
        // Calculate age
        const today = new Date();
        const birthDate = new Date(v);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Must be at least 13 years old
        return age >= 13;
      },
      message: 'Date of birth must be in the past and patient must be at least 13 years old'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other', 'prefer_not_to_say'],
      message: 'Gender must be one of: male, female, other, prefer_not_to_say'
    }
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  emergency_contact: {
    type: emergencyContactSchema,
    required: false
  },
  medical_history: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        // Each medical history item should be a non-empty string
        return v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'Medical history items must be non-empty strings'
    }
  },
  insurance_info: {
    type: insuranceInfoSchema,
    required: false
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  phone_verified: {
    type: Boolean,
    default: false
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
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ phone_number: 1 }, { unique: true });
patientSchema.index({ is_active: 1 });
patientSchema.index({ email_verified: 1 });
patientSchema.index({ phone_verified: 1 });

// Pre-save middleware to hash password
patientSchema.pre('save', async function(next) {
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
patientSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password_hash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Virtual for full name
patientSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Virtual for age
patientSchema.virtual('age').get(function() {
  if (!this.date_of_birth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

const Patient = mongoose.model('Patient', patientSchema, 'patients');

module.exports = Patient; 