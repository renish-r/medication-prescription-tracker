# Medication & Prescription Tracker

A full-stack application for managing medications and prescriptions with separate roles (Doctor, Patient, Pharmacist, Admin).

## Project Structure

```
medication-prescription-tracker/
├── mediui/              # React + Vite Frontend
├── medimanager/         # Spring Boot Backend
└── README.md
```

## Technology Stack

### Frontend (mediui)
- React 18
- Vite
- CSS3

### Backend (medimanager)
- Spring Boot 4.0.1
- JPA/Hibernate
- H2 Database (Development)
- Lombok

## Setup Instructions

### Prerequisites
- Node.js 16+ (for frontend)
- Java 21 (for backend)
- Maven 3.8+
- Git

### Backend Setup (Spring Boot)

1. Navigate to the medimanager folder:
```bash
cd medimanager
```

2. Build the project:
```bash
mvn clean install
```

3. Run the Spring Boot application:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

**API Endpoints:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/prescriptions/create` - Create prescription (Doctor)
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/{patientId}` - Get patient prescriptions
- `GET /api/prescriptions/detail/{id}` - Get prescription details

**H2 Database Console:**
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:medimanagerdb`
- Username: `sa`
- Password: (leave empty)

### Frontend Setup (React + Vite)

1. Navigate to the mediui folder:
```bash
cd mediui
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Application Features

#### Authentication
- User signup with role selection
- Login with email and password
- Role-based access (Admin, Doctor, Patient, Pharmacist)

#### Doctor
- Add prescriptions for patients
- Add multiple medications per prescription
- Specify dosage, timing, duration, and notes

#### Patient
- View all prescriptions assigned to them
- Track active and past prescriptions
- Monitor medication details

#### Pharmacist
- Manage medicine stock
- Update inventory
- View stock levels

#### Admin
- View all prescriptions in the system
- Monitor stock across all medicines
- System overview

## API Documentation

### Auth Endpoints

**Signup**
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "doctor"
}

Response:
{
  "success": true,
  "message": "Signup successful!",
  "userId": 1,
  "name": "John Doe"
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "doctor"
}

Response:
{
  "success": true,
  "message": "Login successful!",
  "userId": 1,
  "name": "John Doe"
}
```

### Prescription Endpoints

**Create Prescription**
```
POST /api/prescriptions/create
Content-Type: application/json

{
  "patientId": "P001",
  "medications": [
    {
      "name": "Aspirin",
      "dosage": "500mg",
      "duration": "5 days",
      "timing": "Morning",
      "notes": "With food"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Prescription created successfully",
  "prescriptionId": 1
}
```

**Get All Prescriptions**
```
GET /api/prescriptions

Response: [
  {
    "id": 1,
    "patientId": "P001",
    "medications": [...],
    "createdAt": "2026-01-20T10:00:00"
  }
]
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prescriptions Table
```sql
CREATE TABLE prescriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patient_id VARCHAR(255) NOT NULL,
  doctor_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);
```

### Medications Table
```sql
CREATE TABLE medications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  timing VARCHAR(100) NOT NULL,
  notes VARCHAR(500),
  prescription_id BIGINT NOT NULL,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);
```

## Development Notes

- Password hashing should be implemented for production (use BCrypt)
- Add proper authentication/JWT tokens
- Implement database migrations using Flyway or Liquibase
- Add comprehensive error handling and validation
- Implement role-based authorization middleware
- Add unit and integration tests

## Future Enhancements

- JWT token-based authentication
- Password hashing with BCrypt
- Email notifications
- Medication reminders
- Stock alerts
- Prescription history and analytics
- User profile management
- Prescription approval workflow
- Medicine interaction checking
