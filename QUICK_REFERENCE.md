#!/usr/bin/env bash
# Quick Reference Card for Medication Prescription Tracker

# ============================================================================
# QUICK START - Copy & Paste Commands
# ============================================================================

# STEP 1: Start Backend (in Terminal 1)
cd medimanager && mvn spring-boot:run

# STEP 2: Start Frontend (in Terminal 2) 
cd mediui && npm install && npm run dev

# STEP 3: Open Browser
# Navigate to: http://localhost:5173

# ============================================================================
# ENDPOINTS REFERENCE
# ============================================================================

# AUTH ENDPOINTS
# POST /api/auth/signup
# {
#   "name": "John Doe",
#   "email": "john@test.com",
#   "password": "password123",
#   "role": "doctor"
# }

# POST /api/auth/login
# {
#   "email": "john@test.com",
#   "password": "password123",
#   "role": "doctor"
# }

# PRESCRIPTION ENDPOINTS
# POST /api/prescriptions/create
# {
#   "patientId": "P001",
#   "medications": [
#     {
#       "name": "Aspirin",
#       "dosage": "500mg",
#       "duration": "5 days",
#       "timing": "Morning",
#       "notes": "After food"
#     }
#   ]
# }

# GET /api/prescriptions
# GET /api/prescriptions/{patientId}
# GET /api/prescriptions/detail/{id}

# ============================================================================
# DATABASE CONSOLE
# ============================================================================

# H2 Database Console
# URL: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:medimanagerdb
# Username: sa
# Password: (empty)

# ============================================================================
# FILE LOCATIONS
# ============================================================================

# Frontend Code:
#   mediui/src/App.jsx       (Main React component)
#   mediui/src/App.css       (Styles)

# Backend Code:
#   medimanager/src/main/java/com/example/medimanager/
#   ├── controller/           (REST API)
#   ├── service/              (Business logic)
#   ├── repository/           (Data access)
#   ├── entity/               (Database entities)
#   └── dto/                  (Data transfer objects)

# Configuration:
#   medimanager/src/main/resources/application.properties
#   medimanager/pom.xml

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# Backend won't start?
# - Check Java version: java -version (needs 21+)
# - Check Maven: mvn -v
# - Port 8080 in use? Change in application.properties

# Frontend won't start?
# - Check Node.js: node -v (needs 16+)
# - Install deps: npm install
# - Port 5173 in use? Vite auto-selects next port

# Can't connect to database?
# - Backend must be running on port 8080
# - Check JDBC URL in H2 console
# - Tables auto-created on first run

# ============================================================================
# USEFUL COMMANDS
# ============================================================================

# Build backend
mvn clean install

# Run backend in debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"

# Build frontend
npm run build

# Run frontend tests
npm run test

# Check application logs
tail -f /var/log/app.log

# ============================================================================
# ROLES & PERMISSIONS
# ============================================================================

# ADMIN
#   - View all prescriptions
#   - View all stock
#   - System overview

# DOCTOR
#   - Create prescriptions
#   - Add medications
#   - View patient list

# PATIENT
#   - View own prescriptions
#   - Track medications
#   - View prescription history

# PHARMACIST
#   - Manage stock
#   - Update inventory
#   - View stock levels

# ============================================================================
# FEATURES BY ROLE
# ============================================================================

# USER FEATURE MATRIX:
# 
#               Admin  Doctor  Patient  Pharmacist
# Login         ✓      ✓       ✓        ✓
# Signup        ✓      ✓       ✓        ✓
# Dashboard     ✓      ✓       ✓        ✓
# Prescriptions ✓      CRUD    R        -
# Medications   ✓      CUD     R        -
# Stock         ✓      -       -        CRUD
# Profile       ✓      ✓       ✓        ✓
# Logout        ✓      ✓       ✓        ✓

# ============================================================================
# API RESPONSE FORMATS
# ============================================================================

# Success Response:
# {
#   "success": true,
#   "message": "Operation successful",
#   "userId": 1,
#   "name": "User Name"
# }

# Error Response:
# {
#   "success": false,
#   "message": "Error description",
#   "userId": null,
#   "name": null
# }

# ============================================================================
# TECHNOLOGY STACK
# ============================================================================

# Frontend:
#   - React 18
#   - Vite 5.x
#   - JavaScript (JSX)
#   - CSS3

# Backend:
#   - Spring Boot 4.0.1
#   - Java 21
#   - JPA/Hibernate
#   - Maven

# Database:
#   - H2 (Development)
#   - MySQL/PostgreSQL (Production ready)

# ============================================================================
# DEPLOYMENT CHECKLIST
# ============================================================================

# Before Production:
# [ ] Implement password hashing (BCrypt)
# [ ] Add JWT authentication
# [ ] Switch to PostgreSQL/MySQL
# [ ] Add proper error handling
# [ ] Add logging
# [ ] Implement role-based authorization
# [ ] Add HTTPS/SSL
# [ ] Restrict CORS origins
# [ ] Add database backups
# [ ] Add monitoring

# ============================================================================
# DOCUMENTATION FILES
# ============================================================================

# SETUP.md                    - Complete setup guide
# QUICKSTART.md               - Quick start (5 mins)
# INTEGRATION_SUMMARY.md      - What was integrated
# VERIFICATION_CHECKLIST.md   - How to test
# DIRECTORY_STRUCTURE.md      - File organization
# COMPLETE_INTEGRATION_GUIDE.md - Comprehensive guide
# QUICK_REFERENCE.md          - This file

# ============================================================================
# SUPPORT & RESOURCES
# ============================================================================

# Spring Boot Docs:
#   https://spring.io/projects/spring-boot

# React Docs:
#   https://react.dev

# Vite Docs:
#   https://vitejs.dev

# JPA/Hibernate:
#   https://spring.io/projects/spring-data-jpa

# ============================================================================
# END OF QUICK REFERENCE
# ============================================================================
