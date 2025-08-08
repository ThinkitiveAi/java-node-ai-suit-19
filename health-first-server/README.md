# Health First Server - Provider Registration Module

A secure Node.js backend module for healthcare provider registration using Express.js, MongoDB, and Mongoose.

## Features

- 🔐 **Secure Provider Registration** with comprehensive validation
- 🛡️ **Security Features**: Input sanitization, password hashing, rate limiting
- 📊 **MongoDB Integration** with Mongoose ODM
- ✅ **Joi Validation** for request data
- 🔒 **Bcrypt Password Hashing** with configurable salt rounds
- 📈 **Provider Statistics** and analytics
- 🔍 **Duplicate Detection** for email, phone, and license numbers
- 📄 **Pagination** for provider listings
- 🏥 **Specialization Management** with predefined medical specialties

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Joi** - Data validation
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-first-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/health_first_db
   JWT_SECRET=your-super-secret-jwt-key-here
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Provider Registration

#### POST `/api/v1/provider/register`
Register a new healthcare provider.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@clinic.com",
  "phone_number": "+1234567890",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
  "specialization": "Cardiology",
  "license_number": "MD123456789",
  "years_of_experience": 10,
  "clinic_address": {
    "street": "123 Medical Center Dr",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider registered successfully",
  "data": {
    "provider": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@clinic.com",
      "specialization": "Cardiology",
      "license_number": "MD123456789",
      "verification_status": "pending",
      "is_active": true,
      "created_at": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

### Additional Endpoints

#### GET `/api/v1/provider/specializations`
Get all available medical specializations.

#### GET `/api/v1/provider/specialization/:specialization`
Get providers by specialization with pagination.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Items per page
- `verified_only` (default: false) - Show only verified providers

#### GET `/api/v1/provider/:id`
Get provider details by ID.

#### GET `/api/v1/provider/check-email/:email`
Check if email already exists.

#### GET `/api/v1/provider/check-license/:license_number`
Check if license number already exists.

#### GET `/api/v1/provider/stats`
Get provider statistics and analytics.

#### GET `/health`
Health check endpoint.

## Validation Rules

### Email
- Valid email format
- Must be unique
- Automatically converted to lowercase

### Phone Number
- Valid international format
- Must be unique
- Minimum 10 digits

### Password
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and special character
- Confirmed password must match

### Names
- 2-50 characters
- Letters, spaces, hyphens, and apostrophes only

### License Number
- Alphanumeric only
- Must be unique

### Years of Experience
- Integer between 0-50
- Default: 0

### Clinic Address
- All fields required
- ZIP code: US 5-digit format
- Street: max 200 characters
- City: max 100 characters
- State: max 50 characters

## Security Features

### Input Sanitization
- XSS prevention
- NoSQL injection protection
- HTML tag removal

### Password Security
- Bcrypt hashing with 12 salt rounds (configurable)
- Never logged or returned in responses
- Strong password requirements

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable via environment variables

### CORS Protection
- Configurable origins
- Credentials support

### Helmet Security
- HTTP headers security
- XSS protection
- Content Security Policy

## Database Schema

### Provider Collection (`providers`)

```javascript
{
  _id: ObjectId,
  first_name: String (2-50 chars, required),
  last_name: String (2-50 chars, required),
  email: String (unique, required, lowercase),
  phone_number: String (unique, required, international format),
  password_hash: String (required, bcrypt hashed),
  specialization: String (3-100 chars, required),
  license_number: String (unique, required, alphanumeric),
  years_of_experience: Number (0-50, default: 0),
  clinic_address: {
    street: String (required, max 200),
    city: String (required, max 100),
    state: String (required, max 50),
    zip: String (required, US 5-digit format)
  },
  verification_status: Enum ("pending", "verified", "rejected", default: "pending"),
  is_active: Boolean (default: true),
  created_at: Date,
  updated_at: Date
}
```

## Available Specializations

- Cardiology
- Dermatology
- Endocrinology
- Family Medicine
- Gastroenterology
- General Surgery
- Internal Medicine
- Neurology
- Obstetrics and Gynecology
- Oncology
- Ophthalmology
- Orthopedics
- Pediatrics
- Psychiatry
- Radiology
- Urology
- Emergency Medicine
- Anesthesiology
- Pathology
- Physical Medicine and Rehabilitation

## Error Handling

The application includes comprehensive error handling:

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **404** - Not Found (resource not found)
- **409** - Conflict (duplicate data)
- **500** - Internal Server Error
- **503** - Service Unavailable (database connection issues)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Development

```bash
# Start development server with nodemon
npm run dev

# Check for linting issues
npm run lint

# Format code
npm run format
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure CORS origins
5. Set up reverse proxy (nginx)
6. Use PM2 or similar process manager

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the development team. 