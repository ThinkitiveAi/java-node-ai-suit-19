# Provider Availability Management Module

## Overview

The Provider Availability Management module enables healthcare providers to create, manage, and schedule their availability slots. It includes comprehensive timezone handling, recurring availability patterns, appointment slot generation, and patient search functionality.

## Features

- ✅ **Timezone-aware scheduling** with moment-timezone
- ✅ **Recurring availability patterns** (daily, weekly, monthly)
- ✅ **Conflict detection** and prevention
- ✅ **Appointment slot generation** based on availability
- ✅ **Patient search functionality** with multiple filters
- ✅ **Custom pricing** and special requirements
- ✅ **Comprehensive validation** and error handling
- ✅ **Statistics and analytics**

## Database Schema

### Provider Availability Collection

```javascript
{
  "_id": ObjectId,
  "provider_id": ObjectId,
  "date": "YYYY-MM-DD",
  "start_time": "HH:mm",
  "end_time": "HH:mm",
  "timezone": "America/New_York",
  "is_recurring": false,
  "recurrence_pattern": "daily/weekly/monthly",
  "recurrence_end_date": "YYYY-MM-DD",
  "slot_duration": 30,
  "break_duration": 0,
  "status": "available",
  "max_appointments_per_slot": 1,
  "current_appointments": 0,
  "appointment_type": "consultation",
  "location": {
    "type": "clinic",
    "address": "123 Medical Center Dr, NY",
    "room_number": "205"
  },
  "pricing": {
    "base_fee": 150.00,
    "insurance_accepted": true,
    "currency": "USD"
  },
  "notes": "Standard consultation slots",
  "special_requirements": ["bring_insurance_card", "fasting_required"],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Appointment Slots Collection

```javascript
{
  "_id": ObjectId,
  "availability_id": ObjectId,
  "provider_id": ObjectId,
  "slot_start_time": ISODate,
  "slot_end_time": ISODate,
  "status": "available",
  "patient_id": ObjectId (nullable),
  "appointment_type": "consultation",
  "booking_reference": "string (unique)"
}
```

## API Endpoints

### 1. Create Availability Slots

**POST** `/api/v1/provider/availability`

**Headers:**
```
Authorization: Bearer <provider_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date": "2024-12-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York",
  "slot_duration": 30,
  "break_duration": 15,
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2024-12-29",
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
  "special_requirements": ["fasting_required", "bring_insurance_card"],
  "notes": "Standard consultation slots"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Availability slots created successfully",
  "data": {
    "availability_id": "uuid-here",
    "slots_created": 32,
    "date_range": {
      "start": "2024-12-15",
      "end": "2024-12-29"
    },
    "total_appointments_available": 224
  }
}
```

### 2. Get Provider Availability

**GET** `/api/v1/provider/:provider_id/availability`

**Query Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `status` (optional): Filter by status (available, unavailable, cancelled)
- `appointment_type` (optional): Filter by appointment type
- `timezone` (optional): Timezone for time conversion

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "provider_id": "uuid-here",
    "availability_summary": {
      "total_slots": 48,
      "available_slots": 32,
      "booked_slots": 14,
      "cancelled_slots": 2
    },
    "availability": [
      {
        "date": "2024-12-15",
        "availability": [
          {
            "availability_id": "uuid-here",
            "start_time": "09:00",
            "end_time": "09:30",
            "status": "available",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true
            }
          }
        ],
        "slots": [
          {
            "slot_id": "uuid-here",
            "start_time": "2024-12-15T09:00:00.000Z",
            "end_time": "2024-12-15T09:30:00.000Z",
            "status": "available",
            "appointment_type": "consultation",
            "booking_reference": null
          }
        ]
      }
    ]
  }
}
```

### 3. Update Availability Slot

**PUT** `/api/v1/provider/availability/:slot_id`

**Headers:**
```
Authorization: Bearer <provider_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "start_time": "10:00",
  "end_time": "10:30",
  "status": "available",
  "notes": "Updated consultation time",
  "pricing": {
    "base_fee": 175.00
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "availability_id": "uuid-here",
    "date": "2024-12-15",
    "start_time": "10:00",
    "end_time": "10:30",
    "status": "available",
    "notes": "Updated consultation time",
    "pricing": {
      "base_fee": 175.00,
      "insurance_accepted": true,
      "currency": "USD"
    }
  }
}
```

### 4. Delete Availability Slot

**DELETE** `/api/v1/provider/availability/:slot_id`

**Headers:**
```
Authorization: Bearer <provider_token>
```

**Query Parameters:**
- `delete_recurring` (boolean, optional): Delete all recurring instances
- `reason` (string, optional): Reason for deletion

**Success Response (200):**
```json
{
  "success": true,
  "message": "Availability deleted successfully",
  "data": {
    "deleted_count": 3
  }
}
```

### 5. Search Available Slots

**GET** `/api/v1/availability/search`

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

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "search_criteria": {
      "date": "2024-12-15",
      "specialization": "cardiology",
      "location": "New York, NY"
    },
    "total_results": 15,
    "results": [
      {
        "provider": {
          "id": "uuid-here",
          "name": "Dr. John Doe",
          "specialization": "Cardiology",
          "years_of_experience": 15,
          "clinic_address": "123 Medical Center Dr, New York, NY"
        },
        "available_slots": [
          {
            "slot_id": "uuid-here",
            "date": "2024-12-15",
            "start_time": "10:00",
            "end_time": "10:30",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true,
              "currency": "USD"
            },
            "special_requirements": ["bring_insurance_card"]
          }
        ]
      }
    ]
  }
}
```

### 6. Get Availability Statistics

**GET** `/api/v1/provider/:provider_id/availability/stats`

**Headers:**
```
Authorization: Bearer <provider_token>
```

**Query Parameters:**
- `start_date` (optional): Start date for statistics
- `end_date` (optional): End date for statistics

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_availability_blocks": 24,
    "total_slots": 192,
    "available_slots": 156,
    "booked_slots": 32,
    "cancelled_slots": 4,
    "completed_slots": 28,
    "no_show_slots": 2,
    "utilization_rate": "16.67"
  }
}
```

## Validation Rules

### Date and Time Validation
- Date must be in YYYY-MM-DD format
- Date cannot be in the past
- Start time and end time must be in HH:mm format
- End time must be after start time
- Slot duration must be divisible by 15 minutes
- Break duration must be divisible by 5 minutes

### Location Validation
- Location type must be one of: clinic, hospital, office, virtual, home_visit
- Address is required and cannot exceed 500 characters
- City and state are required
- ZIP code must be valid 5-digit US format

### Pricing Validation
- Base fee must be between $0 and $10,000
- Currency must be one of: USD, EUR, GBP, CAD
- Copay cannot be negative

### Special Requirements
Must be from predefined list:
- fasting_required
- bring_insurance_card
- bring_medical_records
- wear_comfortable_clothing
- arrive_early
- bring_medication_list
- no_food_before
- bring_photo_id
- companion_allowed

## Timezone Handling

The module uses `moment-timezone` for comprehensive timezone support:

- All times are stored in UTC in the database
- Times are converted to local timezone for display
- Supports daylight saving time (DST) transitions
- Validates timezone names against moment-timezone database

## Conflict Prevention

The module includes comprehensive conflict detection:

- Prevents overlapping availability blocks for the same provider
- Prevents overlapping appointment slots
- Validates time ranges and slot durations
- Checks for existing appointments before deletion

## Testing

Run the test script to verify all functionality:

```bash
node test-availability-module.js
```

## Error Handling

The module includes comprehensive error handling:

- Validation errors with detailed field-specific messages
- Conflict detection with specific overlap details
- Authentication and authorization errors
- Database connection and query errors
- Timezone validation errors

## Security Features

- Input sanitization to prevent XSS and injection attacks
- JWT authentication for protected endpoints
- Role-based authorization (provider-only endpoints)
- Rate limiting on all endpoints
- Comprehensive validation and error handling

## Dependencies

- `express`: Web framework
- `mongoose`: MongoDB ODM
- `joi`: Schema validation
- `moment-timezone`: Timezone handling
- `jsonwebtoken`: JWT authentication
- `bcrypt`: Password hashing
- `helmet`: Security headers
- `cors`: Cross-origin resource sharing
- `express-rate-limit`: Rate limiting 