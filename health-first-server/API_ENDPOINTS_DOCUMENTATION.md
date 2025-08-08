# Health First API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Protected endpoints require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔍 Health Check

### GET /health
**Description:** Check if the server is running  
**Access:** Public  
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-07T18:14:00.162Z",
  "uptime": 123.456
}
```

---

## 👨‍⚕️ Provider Management

### POST /api/v1/provider/register
**Description:** Register a new healthcare provider  
**Access:** Public  
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

### POST /api/v1/provider/login
**Description:** Login provider and get JWT token  
**Access:** Public  
**Request Body:**
```json
{
  "email": "john.doe@clinic.com",
  "password": "SecurePassword123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "jwt_token_here",
    "token_type": "Bearer",
    "expires_in": 3600,
    "provider": {
      "id": "688359bdb9fa80d056cdc6af",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@clinic.com",
      "specialization": "Cardiology"
    }
  }
}
```

### GET /api/v1/provider/specializations
**Description:** Get all available specializations  
**Access:** Public  
**Response:**
```json
{
  "success": true,
  "data": [
    "Cardiology",
    "Pediatrics",
    "Neurology",
    "Dermatology"
  ]
}
```

### GET /api/v1/provider/specialization/:specialization
**Description:** Get providers by specialization with pagination  
**Access:** Public  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET /api/v1/provider/:id
**Description:** Get provider by ID  
**Access:** Public

### GET /api/v1/provider/check-email/:email
**Description:** Check if email already exists  
**Access:** Public

### GET /api/v1/provider/check-license/:license_number
**Description:** Check if license number already exists  
**Access:** Public

### GET /api/v1/provider/stats
**Description:** Get provider statistics  
**Access:** Public

---

## 👤 Patient Management

### POST /api/v1/patient/register
**Description:** Register a new patient  
**Access:** Public  
**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@email.com",
  "phone_number": "+1234567890",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "address": {
    "street": "456 Main Street",
    "city": "Boston",
    "state": "MA",
    "zip": "02101"
  },
  "emergency_contact": {
    "name": "John Smith",
    "phone": "+1234567891",
    "relationship": "spouse"
  },
  "insurance_info": {
    "provider": "Blue Cross",
    "policy_number": "BC123456789"
  },
  "medical_history": ["Hypertension", "Diabetes"]
}
```

### POST /api/v1/patient/login
**Description:** Login patient and get JWT token  
**Access:** Public  
**Request Body:**
```json
{
  "email": "jane.smith@email.com",
  "password": "SecurePassword123!"
}
```

### GET /api/v1/patient/:id
**Description:** Get patient by ID  
**Access:** Public

### GET /api/v1/patient/check-email/:email
**Description:** Check if patient email already exists  
**Access:** Public

### GET /api/v1/patient/check-phone/:phone_number
**Description:** Check if patient phone number already exists  
**Access:** Public

### GET /api/v1/patient/age-range
**Description:** Get patients by age range with pagination  
**Access:** Public  
**Query Parameters:**
- `min_age` (required): Minimum age
- `max_age` (required): Maximum age
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET /api/v1/patient/gender/:gender
**Description:** Get patients by gender with pagination  
**Access:** Public  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET /api/v1/patient/stats
**Description:** Get patient statistics and analytics  
**Access:** Public

### GET /api/v1/patient/with-insurance
**Description:** Get patients with insurance information  
**Access:** Public  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

## 📅 Availability Management

### POST /api/v1/provider/availability
**Description:** Create availability slots for a provider  
**Access:** Private (Provider)  
**Headers:** `Authorization: Bearer <provider_token>`  
**Request Body:**
```json
{
  "date": "2025-12-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York",
  "slot_duration": 30,
  "break_duration": 15,
  "is_recurring": false,
  "appointment_type": "consultation",
  "location": {
    "type": "clinic",
    "address": "123 Medical Center Dr, New York, NY 10001",
    "room_number": "Room 205",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "pricing": {
    "base_fee": 150.00,
    "insurance_accepted": true,
    "currency": "USD",
    "copay": 25.00,
    "deductible_applies": true
  },
  "notes": "Standard consultation slots"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Availability slots created successfully",
  "data": {
    "availability_id": "uuid-here",
    "slots_created": 11,
    "date_range": {
      "start": "2025-12-15",
      "end": "2025-12-15"
    },
    "total_appointments_available": 11
  }
}
```

### GET /api/v1/provider/:provider_id/availability
**Description:** Get provider availability  
**Access:** Public  
**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `status` (optional): Filter by status (available, unavailable, cancelled)
- `appointment_type` (optional): Filter by appointment type
- `timezone` (optional): Timezone for time conversion

### PUT /api/v1/provider/availability/:slot_id
**Description:** Update availability slot  
**Access:** Private (Provider)  
**Headers:** `Authorization: Bearer <provider_token>`  
**Request Body:**
```json
{
  "start_time": "10:00",
  "end_time": "16:00",
  "notes": "Updated consultation time",
  "pricing": {
    "base_fee": 175.00,
    "insurance_accepted": true,
    "currency": "USD",
    "copay": 30.00,
    "deductible_applies": true
  }
}
```

### DELETE /api/v1/provider/availability/:slot_id
**Description:** Delete availability slot  
**Access:** Private (Provider)  
**Headers:** `Authorization: Bearer <provider_token>`  
**Query Parameters:**
- `delete_recurring` (boolean, optional): Delete all recurring instances
- `reason` (string, optional): Reason for deletion

### GET /api/v1/availability/search
**Description:** Search for available slots  
**Access:** Public  
**Query Parameters:**
- `date` (optional): Specific date in YYYY-MM-DD format
- `start_date` & `end_date` (optional): Date range
- `specialization` (optional): Provider specialization
- `location` (optional): City, state, or full address
- `appointment_type` (optional): Type of appointment
- `insurance_accepted` (optional): Filter by insurance acceptance
- `max_price` (optional): Maximum price filter
- `timezone` (optional): Timezone for time conversion (default: America/New_York)
- `available_only` (optional): Show only available slots (default: true)

### GET /api/v1/provider/:provider_id/availability/stats
**Description:** Get availability statistics  
**Access:** Private (Provider)  
**Headers:** `Authorization: Bearer <provider_token>`  
**Query Parameters:**
- `start_date` (optional): Start date for statistics
- `end_date` (optional): End date for statistics

---

## 📊 Complete API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Health check | Public |
| **Provider Management** |
| POST | `/api/v1/provider/register` | Register provider | Public |
| POST | `/api/v1/provider/login` | Login provider | Public |
| GET | `/api/v1/provider/specializations` | Get specializations | Public |
| GET | `/api/v1/provider/specialization/:specialization` | Get providers by specialization | Public |
| GET | `/api/v1/provider/:id` | Get provider by ID | Public |
| GET | `/api/v1/provider/check-email/:email` | Check email exists | Public |
| GET | `/api/v1/provider/check-license/:license_number` | Check license exists | Public |
| GET | `/api/v1/provider/stats` | Get provider stats | Public |
| **Patient Management** |
| POST | `/api/v1/patient/register` | Register patient | Public |
| POST | `/api/v1/patient/login` | Login patient | Public |
| GET | `/api/v1/patient/:id` | Get patient by ID | Public |
| GET | `/api/v1/patient/check-email/:email` | Check patient email exists | Public |
| GET | `/api/v1/patient/check-phone/:phone_number` | Check patient phone exists | Public |
| GET | `/api/v1/patient/age-range` | Get patients by age range | Public |
| GET | `/api/v1/patient/gender/:gender` | Get patients by gender | Public |
| GET | `/api/v1/patient/stats` | Get patient stats | Public |
| GET | `/api/v1/patient/with-insurance` | Get patients with insurance | Public |
| **Availability Management** |
| POST | `/api/v1/provider/availability` | Create availability | Private (Provider) |
| GET | `/api/v1/provider/:provider_id/availability` | Get provider availability | Public |
| PUT | `/api/v1/provider/availability/:slot_id` | Update availability | Private (Provider) |
| DELETE | `/api/v1/provider/availability/:slot_id` | Delete availability | Private (Provider) |
| GET | `/api/v1/availability/search` | Search available slots | Public |
| GET | `/api/v1/provider/:provider_id/availability/stats` | Get availability stats | Private (Provider) |

---

## 🔐 Authentication Flow

1. **Register Provider/Patient** → Get user account
2. **Login** → Get JWT token
3. **Use token** in Authorization header for protected endpoints

## 📝 Usage Instructions

1. **Import the Postman Collection:**
   - Download `Health_First_API_Collection.json`
   - Import into Postman
   - Set the `base_url` variable to your server URL

2. **Test Authentication:**
   - Run "Login Provider" or "Login Patient"
   - Token will be automatically set in collection variables

3. **Test Protected Endpoints:**
   - Use the token for availability management endpoints
   - Token is automatically included in requests

4. **Test Public Endpoints:**
   - No authentication required
   - Can be tested directly

---

## 🚀 Quick Start

1. Start the server: `npm start`
2. Import the Postman collection
3. Test health check: `GET /health`
4. Register a provider: `POST /api/v1/provider/register`
5. Login: `POST /api/v1/provider/login`
6. Create availability: `POST /api/v1/provider/availability`
7. Search slots: `GET /api/v1/availability/search`

The API is now ready for testing and integration! 🎉 