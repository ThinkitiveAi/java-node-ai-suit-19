
# Health First API - Complete Endpoint List

## 🔐 Authentication (2 endpoints)
1. POST /api/v1/provider/login - Provider login
2. POST /api/v1/patient/login - Patient login

## 👨‍⚕️ Provider Management (6 endpoints)
3. POST /api/v1/provider/register - Register provider
4. GET /api/v1/provider/specializations - Get specializations
5. GET /api/v1/provider/:id - Get provider by ID
6. GET /api/v1/provider/check-email - Check email exists
7. GET /api/v1/provider/specialization/:spec - Get providers by specialization
8. GET /api/v1/provider/stats - Get provider statistics

## 👤 Patient Management (8 endpoints)
9. POST /api/v1/patient/register - Register patient
10. GET /api/v1/patient/:id - Get patient by ID
11. GET /api/v1/patient/check-email - Check patient email
12. GET /api/v1/patient/check-phone - Check patient phone
13. GET /api/v1/patient/age-range - Get patients by age range
14. GET /api/v1/patient/gender/:gender - Get patients by gender
15. GET /api/v1/patient/stats - Get patient statistics
16. GET /api/v1/patient/with-insurance - Get patients with insurance

## 📅 Availability Management (7 endpoints)
17. POST /api/v1/provider/availability - Create availability
18. GET /api/v1/provider/:id/availability - Get provider availability
19. PUT /api/v1/provider/availability/:id - Update availability
20. DELETE /api/v1/provider/availability/:id - Delete availability
21. GET /api/v1/availability/search - Search available slots
22. GET /api/v1/provider/:id/availability/stats - Get availability stats

## 🏥 Health Check (1 endpoint)
23. GET /health - Health check

## 🔑 Authentication Required Endpoints
- POST /api/v1/provider/availability (Provider token)
- PUT /api/v1/provider/availability/:id (Provider token)
- DELETE /api/v1/provider/availability/:id (Provider token)
- GET /api/v1/provider/:id/availability/stats (Provider token)

## 🌐 Public Endpoints
- GET /health
- POST /api/v1/provider/login
- POST /api/v1/patient/login
- POST /api/v1/provider/register
- POST /api/v1/patient/register
- GET /api/v1/provider/specializations
- GET /api/v1/provider/:id
- GET /api/v1/provider/check-email
- GET /api/v1/provider/specialization/:spec
- GET /api/v1/provider/stats
- GET /api/v1/patient/:id
- GET /api/v1/patient/check-email
- GET /api/v1/patient/check-phone
- GET /api/v1/patient/age-range
- GET /api/v1/patient/gender/:gender
- GET /api/v1/patient/stats
- GET /api/v1/patient/with-insurance
- GET /api/v1/provider/:id/availability
- GET /api/v1/availability/search
