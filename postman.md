# Smart Healthcare System API Documentation & Testing Guide

## Base URL
`http://localhost:8000/api`

## 🚀 Quick Start Testing Guide

### 1. Health Check (No Auth Required)
**GET** `/status`

**Purpose**: Check if API is running

**Response (200)**:
```json
{
    "status": "success",
    "message": "API is running"
}
```

---

### 2. Authentication Testing

#### A. Login Dokter (Doctor Login)
**POST** `/auth/login`

**Request Body**:
```json
{
    "email": "raihanstrange@gmail.com",
    "password": "qwerty123"
}
```

**Expected Response (200)**:
```json
{
    "access_token": "4|XoaPeowmUTjTKdUPbb5qLL1uvuc1ym5SudezOFDP71ea6695",
    "token_type": "Bearer"
}
```

#### B. Login Pasien (Patient Login)
**POST** `/auth/login`

**Request Body**:
```json
{
    "email": "raihanstark@gmail.com",
    "password": "qwerty123"
}
```

---

## 👨‍⚕️ DOCTOR ROLE FEATURES

### 📅 Doctor Availability Management

#### Get All Doctor Availability (Public)
**GET** `/janji/ketersediaan-all`

**Purpose**: Get all doctors with their availability for next 7 days

**Expected Response (200)**:
```json
[
    {
        "id_dokter": 1,
        "nama_dokter": "Raihan Strange",
        "spesialisasi": "Ahli Sihir",
        "biaya_konsultasi": 100000.00,
        "shift": "pagi",
        "jadwal_ketersediaan": [
            {
                "tanggal": "2025-11-09",
                "hari": "Sunday",
                "jam_terisi": "Belum ada janji temu",
                "slot_tersedia": ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
                "shift": "pagi"
            }
        ]
    }
]
```

---

### 🔍 Appointment Search (Doctor)

#### Search Appointments (Requires Auth)
**GET** `/janji/search`

**Headers Required**:
```
Authorization: Bearer [doctor_token]
```

**Query Parameters**:
- `tanggal` (optional): Filter by date (YYYY-MM-DD)
- `nama_dokter` (optional): Filter by doctor name

**Example - Search by Date**:
```
GET /janji/search?tanggal=2025-11-10
```

**Example - Search by Doctor Name**:
```
GET /janji/search?nama_dokter=Strange
```

**Example - Combined Search**:
```
GET /janji/search?tanggal=2025-11-10&nama_dokter=Strange
```

**Expected Response (200)**:
```json
[
    {
        "id_janji_temu": 2,
        "pasien": {
            "id_pasien": 2,
            "nama_pasien": "Raihan Stark"
        },
        "dokter": {
            "id_dokter": 1,
            "nama_dokter": "Raihan Strange",
            "spesialisasi": "Ahli Sihir"
        },
        "tanggal_janji": "2025-11-10",
        "waktu_mulai": "09:00:00",
        "waktu_selesai": "10:00:00",
        "status": "terjadwal",
        "keluhan": "Sakit kepala dan demam"
    }
]
```

---

### ✅ Complete Appointment (Doctor Only)

#### Update Appointment Status to "selesai" (Requires Auth)
**PUT** `/janji/{id}`

**Headers Required**:
```
Authorization: Bearer [doctor_token]
Content-Type: application/json
```

**Request Body**:
```json
{
    "status": "selesai"
}
```

**Role-Based Restriction**:
- **Doctors**: Can only complete appointments (status: "selesai")

**Expected Success Response (200)**:
```json
{
    "message": "Janji temu berhasil diperbarui",
    "data": {
        "id_janji_temu": 2,
        "status": "selesai"
    }
}
```

**Expected Error Response (403)**:
```json
{
    "error": "Dokter hanya dapat menyelesaikan janji temu"
}
```

---

## 🧑‍⚕️ PATIENT ROLE FEATURES

### 📋 Appointment Booking (Patient)

#### Quick Appointment Booking (Requires Auth)
**POST** `/janji/booking-cepat`

**Headers Required**:
```
Authorization: Bearer [patient_token]
Content-Type: application/json
```

**Request Body - Success Case**:
```json
{
    "id_dokter": 1,
    "tanggal": "2025-11-10",
    "waktu_mulai": "09:00",
    "keluhan": "Sakit kepala dan demam"
}
```

**Expected Response (201)**:
```json
{
    "message": "Janji temu berhasil dibooking",
    "data": {
        "id_janji_temu": 1,
        "id_pasien": 2,
        "id_dokter": 1,
        "tanggal_janji": "2025-11-10",
        "waktu_mulai": "09:00",
        "waktu_selesai": "10:00",
        "status": "terjadwal",
        "keluhan": "Sakit kepala dan demam",
        "created_at": "2025-11-09T09:30:00.000000Z",
        "updated_at": "2025-11-09T09:30:00.000000Z"
    }
}
```

**Request Body - Duplicate Slot (Error Case)**:
```json
{
    "id_dokter": 1,
    "tanggal": "2025-11-10",
    "waktu_mulai": "09:00",
    "keluhan": "Coba booking ulang slot yang sama"
}
```

**Expected Error Response (400)**:
```json
{
    "error": "Slot waktu ini sudah terisi"
}
```

---

### 🔍 Appointment Search (Patient)

#### Search Patient's Appointments (Requires Auth)
**GET** `/janji/search`

**Headers Required**:
```
Authorization: Bearer [patient_token]
```

**Query Parameters**:
- `tanggal` (optional): Filter by date (YYYY-MM-DD)
- `nama_dokter` (optional): Filter by doctor name

**Example - Search by Date**:
```
GET /janji/search?tanggal=2025-11-10
```

**Example - Search by Doctor Name**:
```
GET /janji/search?nama_dokter=Strange
```

**Expected Response (200)**:
```json
[
    {
        "id_janji_temu": 2,
        "pasien": {
            "id_pasien": 2,
            "nama_pasien": "Raihan Stark"
        },
        "dokter": {
            "id_dokter": 1,
            "nama_dokter": "Raihan Strange",
            "spesialisasi": "Ahli Sihir"
        },
        "tanggal_janji": "2025-11-10",
        "waktu_mulai": "09:00:00",
        "waktu_selesai": "10:00:00",
        "status": "terjadwal",
        "keluhan": "Sakit kepala dan demam"
    }
]
```

---

### ❌ Cancel Appointment (Patient Only)

#### Update Appointment Status to "dibatalkan" (Requires Auth)
**PUT** `/janji/{id}`

**Headers Required**:
```
Authorization: Bearer [patient_token]
Content-Type: application/json
```

**Request Body**:
```json
{
    "status": "dibatalkan"
}
```

**Role-Based Restriction**:
- **Patients**: Can only cancel appointments (status: "dibatalkan")

**Expected Success Response (200)**:
```json
{
    "message": "Janji temu berhasil diperbarui",
    "data": {
        "id_janji_temu": 2,
        "status": "dibatalkan"
    }
}
```

**Expected Error Response (403)**:
```json
{
    "error": "Pasien hanya dapat membatalkan janji temu"
}
```

---

## 👤 USER PROFILE (ALL ROLES)

### Get Current User Profile (Requires Auth)
**GET** `/user`

**Headers Required**:
```
Authorization: Bearer [token]
```

**Expected Response (200)**:
```json
{
    "id_pengguna": 2,
    "nama": "Raihan Stark",
    "email": "raihanstark@gmail.com",
    "role": "pasien",
    "created_at": "2025-11-09T00:00:00.000000Z",
    "updated_at": "2025-11-09T00:00:00.000000Z"
}
```

---

## 📋 Testing Checklist by Role

### ✅ Basic Functionality (No Auth Required)
- [ ] Health check endpoint working
- [ ] Doctor login successful
- [ ] Patient login successful

### 👨‍⚕️ DOCTOR ROLE TESTING
- [ ] Get doctor availability returns data
- [ ] Search appointments by date working (Doctor)
- [ ] Search appointments by doctor name working (Doctor)
- [ ] Combined search (date + doctor) working (Doctor)
- [ ] Doctor can complete appointments (status: "selesai")
- [ ] Doctor cannot cancel appointments (blocked)
- [ ] Doctor cannot book appointments (Patient feature)

### 🧑‍⚕️ PATIENT ROLE TESTING
- [ ] Successful appointment booking
- [ ] Duplicate slot prevention working
- [ ] Doctor shift filtering (pagi/malam) working
- [ ] Available slots calculation correct
- [ ] Search appointments by date working (Patient)
- [ ] Search appointments by doctor name working (Patient)
- [ ] Combined search (date + doctor) working (Patient)
- [ ] Patient can cancel appointments (status: "dibatalkan")
- [ ] Patient cannot complete appointments (blocked)
- [ ] Patient cannot complete appointments (blocked)

### 👤 USER PROFILE (ALL ROLES)
- [ ] Current user endpoint returns correct data
- [ ] Role information is accurate in response

### ✅ Role-Based Access Control
- [ ] Patient can only cancel appointments
- [ ] Doctor can only complete appointments
- [ ] Error messages for unauthorized status updates
- [ ] Token validation working for all protected endpoints

### ✅ Error Handling
- [ ] Invalid login credentials rejected
- [ ] Missing auth token rejected
- [ ] Invalid time slots rejected
- [ ] Duplicate bookings prevented

---

## 🔧 Postman Collection Setup

### Environment Variables
Create environment with these variables:
```
base_url: http://localhost:8000/api
doctor_token: 4|XoaPeowmUTjTKdUPbb5qLL1uvuc1ym5SudezOFDP71ea6695
patient_token: [get from patient login]
```

### Collection Structure by Role
```
Smart Healthcare API/
├── 01. Health Check/
│   └── GET Status
├── 02. Authentication/
│   ├── POST Doctor Login
│   └── POST Patient Login
├── 03. Doctor Role Features/
│   ├── 📅 Doctor Availability/
│   │   └── GET All Availability
│   ├── 🔍 Appointment Search/
│   │   ├── GET Search by Date
│   │   ├── GET Search by Doctor Name
│   │   └── GET Combined Search
│   └── ✅ Complete Appointment/
│       └── PUT Update Status to "selesai"
├── 04. Patient Role Features/
│   ├── 📋 Appointment Booking/
│   │   └── POST Quick Booking
│   ├── 🔍 Appointment Search/
│   │   ├── GET Search by Date
│   │   ├── GET Search by Doctor Name
│   │   └── GET Combined Search
│   └── ❌ Cancel Appointment/
│       └── PUT Update Status to "dibatalkan"
└── 05. User Profile (All Roles)/
    └── GET Current User
```

---

## 📊 Test Data Reference

### Doctors Available
| ID | Name | Specialization | Shift | Email |
|----|------|----------------|-------|-------|
| 1 | Raihan Strange | Ahli Sihir | pagi | raihanstrange@gmail.com |
| 2 | Raihan Wong | Umum | malam | raiihanwong.malam@clinic.com |

### Patients Available
| ID | Name | Email |
|----|------|-------|
| 2 | Raihan Stark | raihanstark@gmail.com |

---

## 🚨 Common Issues & Solutions

### 1. Token Expired
**Solution**: Re-login to get new token

### 2. 404 Not Found
**Solution**: Check base URL and endpoint spelling

### 3. 500 Internal Server Error
**Solution**: Check Laravel logs in `storage/logs/laravel.log`

### 4. Database Connection Error
**Solution**: Ensure MySQL is running and `.env` configuration is correct

---

## 📝 Notes
- Token expires after certain time - re-login if needed
- Doctor availability shows next 7 days from current date
- Shift "pagi": 07:00-18:00, Shift "malam": 19:00-23:00
- Each appointment takes 1 hour slot
- Duplicate bookings are prevented automatically

---

## 🔐 Role-Based Permissions Summary

### 👨‍⚕️ DOCTOR ROLE
✅ **Can Do:**
- View doctor availability (all doctors)
- Search appointments (by date, doctor name, or combined)
- Complete appointments (update status to "selesai")
- View current user profile

❌ **Cannot Do:**
- Book appointments (Patient feature)
- Cancel appointments (Patient feature)

### 🧑‍⚕️ PATIENT ROLE
✅ **Can Do:**
- Book appointments (quick booking)
- Search appointments (by date, doctor name, or combined)
- Cancel own appointments (update status to "dibatalkan")
- View current user profile

❌ **Cannot Do:**
- Complete appointments (Doctor feature)

### 👤 ALL ROLES (Doctor & Patient)
✅ **Can Do:**
- Login and get authentication token
- View current user profile
- Search appointments with filters

## Appointment Services

### Get All Doctor Availability
**GET** `/janji/ketersediaan-all`

Public endpoint to get all doctor availability for the next 7 days.

Response (200):
```json
[
    {
        "id_dokter": 1,
        "nama_dokter": "Dr. Andi Wijaya",
        "spesialisasi": "Dokter Umum",
        "biaya_konsultasi": 150000,
        "shift": "Pagi",
        "jadwal_ketersediaan": [
            {
                "tanggal": "2024-01-15",
                "hari": "Senin",
                "jam_terisi": ["08:00", "09:00"],
                "shift": "Pagi",
                "slot_tersedia": ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]
            }
        ]
    }
]
```

### Quick Appointment Booking
**POST** `/janji/booking-cepat`

Requires authentication (Bearer token).

Request Headers:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

Request Body:
```json
{
    "id_dokter": 1,
    "tanggal": "2024-01-15",
    "waktu_mulai": "10:00",
    "keluhan": "Sakit kepala dan demam"
}
```

Response (201):
```json
{
    "message": "Janji temu berhasil dibooking",
    "data": {
        "id_janji_temu": 1,
        "id_pasien": 1,
        "id_dokter": 1,
        "tanggal_janji": "2024-01-15",
        "waktu_mulai": "10:00",
        "waktu_selesai": "11:00",
        "status": "terjadwal",
        "keluhan": "Sakit kepala dan demam",
        "created_at": "2024-01-10T08:30:00.000000Z",
        "updated_at": "2024-01-10T08:30:00.000000Z"
    }
}
```

Error Response (400):
```json
{
    "error": "Slot waktu ini sudah terisi"
}
```

## Test Status
**GET** `/status`

Simple health check endpoint.

Response (200):
```json
{
    "status": "success",
    "message": "API is running"
}
```

## Get Current User
**GET** `/user`

Requires authentication (Bearer token).

Response (200):
```json
{
    "id_pengguna": 1,
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "pasien",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
}
```