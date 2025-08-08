const Provider = require('../models/Provider');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { generateProviderAccessToken, getProviderTokenExpirationTime } = require('../utils/jwtUtils');

// @desc    Register a new provider
// @route   POST /api/v1/provider/register
// @access  Public
const registerProvider = asyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    specialization,
    license_number,
    years_of_experience,
    clinic_address
  } = req.validatedData;

  try {
    // Create new provider instance
    const provider = new Provider({
      first_name,
      last_name,
      email: email.toLowerCase(),
      phone_number,
      password_hash: password, // Will be hashed by pre-save middleware
      specialization,
      license_number,
      years_of_experience: years_of_experience || 0,
      clinic_address
    });

    // Save provider to database
    const savedProvider = await provider.save();

    // Log successful registration (without sensitive data)
    console.log(`Provider registered successfully: ${savedProvider.email} (ID: ${savedProvider._id})`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Provider registered successfully',
      data: {
        provider: {
          id: savedProvider._id,
          first_name: savedProvider.first_name,
          last_name: savedProvider.last_name,
          email: savedProvider.email,
          specialization: savedProvider.specialization,
          license_number: savedProvider.license_number,
          verification_status: savedProvider.verification_status,
          is_active: savedProvider.is_active,
          created_at: savedProvider.created_at
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
    console.error('Provider registration error:', error);
    next(error);
  }
});

// @desc    Login provider
// @route   POST /api/v1/provider/login
// @access  Public
const loginProvider = asyncHandler(async (req, res, next) => {
  const { email, password } = req.validatedData;

  try {
    // Find provider by email
    const provider = await Provider.findOne({ email: email.toLowerCase() });

    if (!provider) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if provider account is active
    if (!provider.is_active) {
      return next(new AppError('Account is deactivated. Please contact support.', 401));
    }

    // Check if provider is verified
    if (provider.verification_status !== 'verified') {
      return next(new AppError('Account is not verified. Please contact support.', 401));
    }

    // Verify password
    const isPasswordValid = await provider.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token with provider-specific payload
    const tokenPayload = {
      provider_id: provider._id.toString(),
      email: provider.email,
      role: 'provider',
      specialization: provider.specialization
    };

    const accessToken = generateProviderAccessToken(tokenPayload);
    const expiresIn = getProviderTokenExpirationTime();

    // Log successful login (without sensitive data)
    console.log(`Provider logged in successfully: ${provider.email} (ID: ${provider._id})`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        provider: {
          id: provider._id,
          first_name: provider.first_name,
          last_name: provider.last_name,
          email: provider.email,
          specialization: provider.specialization,
          license_number: provider.license_number,
          years_of_experience: provider.years_of_experience,
          verification_status: provider.verification_status,
          is_active: provider.is_active,
          last_login: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Provider login error:', error);
    next(error);
  }
});

// @desc    Get all specializations
// @route   GET /api/v1/provider/specializations
// @access  Public
const getSpecializations = asyncHandler(async (req, res, next) => {
  const specializations = Provider.getSpecializations();
  
  res.status(200).json({
    success: true,
    data: {
      specializations,
      count: specializations.length
    }
  });
});

// @desc    Get providers by specialization
// @route   GET /api/v1/provider/specialization/:specialization
// @access  Public
const getProvidersBySpecialization = asyncHandler(async (req, res, next) => {
  const { specialization } = req.params;
  const { page = 1, limit = 10, verified_only = false } = req.query;

  // Build query
  const query = { 
    specialization: { $regex: specialization, $options: 'i' },
    is_active: true
  };

  if (verified_only === 'true') {
    query.verification_status = 'verified';
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const providers = await Provider.find(query)
    .select('-password_hash')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Provider.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      providers,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_count: total,
        has_next: skip + providers.length < total,
        has_prev: parseInt(page) > 1
      }
    }
  });
});

// @desc    Get provider by ID
// @route   GET /api/v1/provider/:id
// @access  Public
const getProviderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const provider = await Provider.findById(id)
    .select('-password_hash');

  if (!provider) {
    return next(new AppError('Provider not found', 404));
  }

  if (!provider.is_active) {
    return next(new AppError('Provider account is inactive', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      provider
    }
  });
});

// @desc    Check if email exists
// @route   GET /api/v1/provider/check-email/:email
// @access  Public
const checkEmailExists = asyncHandler(async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(new AppError('Email parameter is required', 400));
  }

  const provider = await Provider.findOne({ email: email.toLowerCase() })
    .select('email');

  res.status(200).json({
    success: true,
    data: {
      email_exists: !!provider,
      email: email.toLowerCase()
    }
  });
});

// @desc    Check if license number exists
// @route   GET /api/v1/provider/check-license/:license_number
// @access  Public
const checkLicenseExists = asyncHandler(async (req, res, next) => {
  const { license_number } = req.params;

  if (!license_number) {
    return next(new AppError('License number parameter is required', 400));
  }

  const provider = await Provider.findOne({ license_number })
    .select('license_number');

  res.status(200).json({
    success: true,
    data: {
      license_exists: !!provider,
      license_number
    }
  });
});

// @desc    Get provider statistics
// @route   GET /api/v1/provider/stats
// @access  Public
const getProviderStats = asyncHandler(async (req, res, next) => {
  const stats = await Provider.aggregate([
    {
      $group: {
        _id: null,
        total_providers: { $sum: 1 },
        verified_providers: {
          $sum: { $cond: [{ $eq: ['$verification_status', 'verified'] }, 1, 0] }
        },
        pending_providers: {
          $sum: { $cond: [{ $eq: ['$verification_status', 'pending'] }, 1, 0] }
        },
        active_providers: {
          $sum: { $cond: ['$is_active', 1, 0] }
        }
      }
    }
  ]);

  const specializationStats = await Provider.aggregate([
    {
      $group: {
        _id: '$specialization',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overall: stats[0] || {
        total_providers: 0,
        verified_providers: 0,
        pending_providers: 0,
        active_providers: 0
      },
      top_specializations: specializationStats
    }
  });
});

module.exports = {
  registerProvider,
  loginProvider,
  getSpecializations,
  getProvidersBySpecialization,
  getProviderById,
  checkEmailExists,
  checkLicenseExists,
  getProviderStats
}; 