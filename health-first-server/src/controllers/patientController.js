const Patient = require('../models/Patient');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { generateAccessToken, getTokenExpirationTime } = require('../utils/jwtUtils');

// @desc    Register a new patient
// @route   POST /api/v1/patient/register
// @access  Public
const registerPatient = asyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    date_of_birth,
    gender,
    address,
    emergency_contact,
    medical_history,
    insurance_info
  } = req.validatedData;

  try {
    // Create new patient instance
    const patient = new Patient({
      first_name,
      last_name,
      email: email.toLowerCase(),
      phone_number,
      password_hash: password, // Will be hashed by pre-save middleware
      date_of_birth: new Date(date_of_birth),
      gender,
      address,
      emergency_contact,
      medical_history: medical_history || [],
      insurance_info
    });

    // Save patient to database
    const savedPatient = await patient.save();

    // Log successful registration (without sensitive data)
    console.log(`Patient registered successfully: ${savedPatient.email} (ID: ${savedPatient._id})`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient: {
          id: savedPatient._id,
          first_name: savedPatient.first_name,
          last_name: savedPatient.last_name,
          email: savedPatient.email,
          age: savedPatient.age,
          gender: savedPatient.gender,
          email_verified: savedPatient.email_verified,
          phone_verified: savedPatient.phone_verified,
          is_active: savedPatient.is_active,
          created_at: savedPatient.created_at
        }
      }
    });
  } catch (error) {
    // Handle specific database errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 409));
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message).join(', ');
      return next(new AppError(message, 400));
    }

    // Log error and pass to error handler
    console.error('Patient registration error:', error);
    next(error);
  }
});

// @desc    Login patient
// @route   POST /api/v1/patient/login
// @access  Public
const loginPatient = asyncHandler(async (req, res, next) => {
  const { email, password } = req.validatedData;

  try {
    // Find patient by email
    const patient = await Patient.findOne({ email: email.toLowerCase() });

    if (!patient) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if patient account is active
    if (!patient.is_active) {
      return next(new AppError('Account is deactivated. Please contact support.', 401));
    }

    // Verify password
    const isPasswordValid = await patient.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const tokenPayload = {
      patient_id: patient._id.toString(),
      email: patient.email,
      role: 'patient'
    };

    const accessToken = generateAccessToken(tokenPayload);
    const expiresIn = getTokenExpirationTime();

    // Log successful login (without sensitive data)
    console.log(`Patient logged in successfully: ${patient.email} (ID: ${patient._id})`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        patient: {
          id: patient._id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          age: patient.age,
          gender: patient.gender,
          email_verified: patient.email_verified,
          phone_verified: patient.phone_verified,
          is_active: patient.is_active,
          last_login: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Patient login error:', error);
    next(error);
  }
});

// @desc    Get patient by ID
// @route   GET /api/v1/patient/:id
// @access  Public
const getPatientById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findById(id)
    .select('-password_hash');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  if (!patient.is_active) {
    return next(new AppError('Patient account is inactive', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      patient
    }
  });
});

// @desc    Check if email exists
// @route   GET /api/v1/patient/check-email/:email
// @access  Public
const checkEmailExists = asyncHandler(async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(new AppError('Email parameter is required', 400));
  }

  const patient = await Patient.findOne({ email: email.toLowerCase() })
    .select('email');

  res.status(200).json({
    success: true,
    data: {
      email_exists: !!patient,
      email: email.toLowerCase()
    }
  });
});

// @desc    Check if phone number exists
// @route   GET /api/v1/patient/check-phone/:phone_number
// @access  Public
const checkPhoneExists = asyncHandler(async (req, res, next) => {
  const { phone_number } = req.params;

  if (!phone_number) {
    return next(new AppError('Phone number parameter is required', 400));
  }

  const patient = await Patient.findOne({ phone_number })
    .select('phone_number');

  res.status(200).json({
    success: true,
    data: {
      phone_exists: !!patient,
      phone_number
    }
  });
});

// @desc    Get patients by age range
// @route   GET /api/v1/patient/age-range
// @access  Public
const getPatientsByAgeRange = asyncHandler(async (req, res, next) => {
  const { min_age = 0, max_age = 120, page = 1, limit = 10 } = req.query;

  // Calculate date range for age filter
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - parseInt(min_age), today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - parseInt(max_age) - 1, today.getMonth(), today.getDate());

  const query = {
    date_of_birth: {
      $gte: minDate,
      $lte: maxDate
    },
    is_active: true
  };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const patients = await Patient.find(query)
    .select('-password_hash')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Patient.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      patients,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        has_next: skip + patients.length < total,
        has_prev: parseInt(page) > 1
      },
      age_range: {
        min_age: parseInt(min_age),
        max_age: parseInt(max_age)
      }
    }
  });
});

// @desc    Get patients by gender
// @route   GET /api/v1/patient/gender/:gender
// @access  Public
const getPatientsByGender = asyncHandler(async (req, res, next) => {
  const { gender } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!['male', 'female', 'other', 'prefer_not_to_say'].includes(gender)) {
    return next(new AppError('Invalid gender parameter', 400));
  }

  const query = {
    gender,
    is_active: true
  };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const patients = await Patient.find(query)
    .select('-password_hash')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Patient.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      patients,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        has_next: skip + patients.length < total,
        has_prev: parseInt(page) > 1
      },
      gender
    }
  });
});

// @desc    Get patient statistics
// @route   GET /api/v1/patient/stats
// @access  Public
const getPatientStats = asyncHandler(async (req, res, next) => {
  const stats = await Patient.aggregate([
    {
      $group: {
        _id: null,
        total_patients: { $sum: 1 },
        email_verified_patients: {
          $sum: { $cond: ['$email_verified', 1, 0] }
        },
        phone_verified_patients: {
          $sum: { $cond: ['$phone_verified', 1, 0] }
        },
        active_patients: {
          $sum: { $cond: ['$is_active', 1, 0] }
        }
      }
    }
  ]);

  const genderStats = await Patient.aggregate([
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const ageGroupStats = await Patient.aggregate([
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$date_of_birth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$age', 18] }, then: 'Under 18' },
              { case: { $lt: ['$age', 30] }, then: '18-29' },
              { case: { $lt: ['$age', 50] }, then: '30-49' },
              { case: { $lt: ['$age', 65] }, then: '50-64' }
            ],
            default: '65 and over'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: stats[0] || {
        total_patients: 0,
        email_verified_patients: 0,
        phone_verified_patients: 0,
        active_patients: 0
      },
      gender_distribution: genderStats,
      age_distribution: ageGroupStats
    }
  });
});

// @desc    Get patients with insurance
// @route   GET /api/v1/patient/with-insurance
// @access  Public
const getPatientsWithInsurance = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const query = {
    insurance_info: { $exists: true, $ne: null },
    is_active: true
  };

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const patients = await Patient.find(query)
    .select('-password_hash')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Patient.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      patients,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        has_next: skip + patients.length < total,
        has_prev: parseInt(page) > 1
      }
    }
  });
});

module.exports = {
  registerPatient,
  loginPatient,
  getPatientById,
  checkEmailExists,
  checkPhoneExists,
  getPatientsByAgeRange,
  getPatientsByGender,
  getPatientStats,
  getPatientsWithInsurance
}; 