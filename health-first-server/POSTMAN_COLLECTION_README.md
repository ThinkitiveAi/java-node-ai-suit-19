# Health First API - Postman Collection

This Postman collection contains all available APIs for the Health First healthcare management system.

## 📋 Collection Overview

The collection is organized into four main sections:

1. **Health Check** - Server health monitoring
2. **Provider Management** - Healthcare provider operations
3. **Patient Management** - Patient operations
4. **Availability Management** - Appointment scheduling and availability

## 🚀 Quick Setup

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `Health_First_API_Collection.json` file
4. The collection will be imported with all endpoints

### 2. Configure Environment Variables
The collection uses the following variables:
- `base_url`: Server base URL (default: `http://localhost:3000`)
- `provider_token`: JWT token for provider authentication
- `patient_token`: JWT token for patient authentication

### 3. Start the Server
```bash
cd health-first-server
npm install
npm start
```

## 🔐 Authentication

### Provider Authentication
1. Use the "Register Provider" endpoint to create a provider account
2. Use the "Login Provider" endpoint to get a JWT token
3. The token will be automatically stored in the `provider_token` variable
4. Protected endpoints will use this token automatically

### Patient Authentication
1. Use the "Register Patient" endpoint to create a patient account
2. Use the "Login Patient" endpoint to get a JWT token
3. The token will be automatically stored in the `patient_token` variable

## 📊 API Endpoints

### Health Check
- `GET /health` - Check server status

### Provider Management
- `POST /api/v1/provider/register` - Register new provider
- `POST /api/v1/provider/login` - Provider login
- `GET /api/v1/provider/specializations` - Get all specializations
- `GET /api/v1/provider/specialization/:specialization` - Get providers by specialization
- `GET /api/v1/provider/:id` - Get provider by ID
- `GET /api/v1/provider/check-email/:email` - Check email availability
- `GET /api/v1/provider/check-license/:license_number` - Check license availability
- `GET /api/v1/provider/stats` - Get provider statistics

### Patient Management
- `POST /api/v1/patient/register` - Register new patient
- `POST /api/v1/patient/login` - Patient login
- `GET /api/v1/patient/:id` - Get patient by ID
- `GET /api/v1/patient/check-email/:email` - Check email availability
- `GET /api/v1/patient/check-phone/:phone_number` - Check phone availability
- `GET /api/v1/patient/age-range` - Get patients by age range
- `GET /api/v1/patient/gender/:gender` - Get patients by gender
- `GET /api/v1/patient/stats` - Get patient statistics
- `GET /api/v1/patient/with-insurance` - Get patients with insurance

### Availability Management
- `POST /api/v1/provider/availability` - Create availability slots (Protected)
- `GET /api/v1/provider/:provider_id/availability` - Get provider availability
- `PUT /api/v1/provider/availability/:slot_id` - Update availability slot (Protected)
- `DELETE /api/v1/provider/availability/:slot_id` - Delete availability slot (Protected)
- `GET /api/v1/availability/search` - Search available slots
- `GET /api/v1/provider/:provider_id/availability/stats` - Get availability stats (Protected)

## 📝 Request Examples

### Provider Registration
```json
{
  "first_name": "Dr. John",
  "last_name": "Smith",
  "email": "john.smith@healthcare.com",
  "phone_number": "+1-555-123-4567",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "specialization": "Cardiology",
  "license_number": "MD123456",
  "years_of_experience": 15,
  "clinic_address": "123 Medical Center Dr, Healthcare City, HC 12345"
}
```

### Patient Registration
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane.doe@email.com",
  "phone_number": "+1-555-987-6543",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "address": "456 Patient Street, Health City, HC 54321",
  "emergency_contact": {
    "name": "John Doe",
    "relationship": "Spouse",
    "phone": "+1-555-111-2222"
  },
  "medical_history": [
    {
      "condition": "Hypertension",
      "diagnosed_date": "2020-01-15",
      "status": "controlled"
    }
  ],
  "insurance_info": {
    "provider": "HealthCare Plus",
    "policy_number": "HC123456789",
    "group_number": "GRP001"
  }
}
```

### Create Availability
```json
{
  "date": "2024-01-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York",
  "slot_duration": 30,
  "break_duration": 15,
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2024-02-15",
  "max_appointments_per_slot": 1,
  "notes": "Regular office hours"
}
```

## 🔧 Features

### Auto Token Management
The collection automatically extracts and stores JWT tokens from login responses:
- Provider tokens are stored in `provider_token`
- Patient tokens are stored in `patient_token`
- Protected endpoints automatically use the appropriate token

### Pre-request Scripts
- Automatically sets base URL if not configured
- Handles token extraction from responses

### Test Scripts
- Validates response status codes
- Extracts and stores authentication tokens
- Provides helpful error messages

## 🛠️ Testing Workflow

1. **Start with Health Check** - Verify server is running
2. **Register a Provider** - Create a test provider account
3. **Login Provider** - Get authentication token
4. **Register a Patient** - Create a test patient account
5. **Login Patient** - Get patient authentication token
6. **Test Protected Endpoints** - Use the stored tokens to test protected APIs
7. **Test Availability Management** - Create and manage availability slots

## 📋 Validation Rules

### Provider Registration
- First/Last name: 2-50 characters, letters only
- Email: Valid email format
- Phone: International format, minimum 10 digits
- Password: 8+ characters, uppercase, lowercase, number, special character
- License number: Alphanumeric only
- Specialization: 3-100 characters

### Patient Registration
- First/Last name: 2-50 characters, letters only
- Email: Valid email format
- Phone: International format, minimum 10 digits
- Password: 8+ characters, uppercase, lowercase, number, special character
- Date of birth: Must be in the past, minimum age 0, maximum age 120
- Gender: Must be 'male', 'female', or 'other'

### Availability Creation
- Date: YYYY-MM-DD format, cannot be in the past
- Start/End time: HH:mm format
- Timezone: Valid timezone identifier
- Slot duration: 15-240 minutes, divisible by 15
- Break duration: 0-60 minutes, divisible by 5

## 🚨 Error Handling

The API returns consistent error responses:
```json
{
  "error": "Error message",
  "status": "error",
  "statusCode": 400
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## 🔄 Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP
- Rate limit headers are included in responses
- Exceeded limits return 429 status code

## 📚 Additional Resources

- Check the `API_ENDPOINTS_DOCUMENTATION.md` for detailed endpoint documentation
- Review `swagger.json` for OpenAPI specification
- See `README.md` for server setup instructions 