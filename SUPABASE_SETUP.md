# Supabase Integration Setup

## Overview

The application is now configured to use **Supabase PostgreSQL** database instead of H2. Your credentials are already set up.

## What Was Updated

✅ **Spring Boot Configuration**
- Changed database driver from H2 to PostgreSQL
- Updated `application.properties` to use Supabase PostgreSQL
- Added Supabase configuration class

✅ **Environment Variables**
- Created `.env` file with your Supabase credentials
- Ready to connect to your Supabase project

✅ **Dependencies**
- Updated `pom.xml` to use PostgreSQL JDBC driver

## Getting Your Database Password

You need to set your Supabase database password. Follow these steps:

### Step 1: Get Your Database Password from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `sqdsxqruqgkfgnvitjub`
3. Click **Settings** → **Database**
4. Look for the **Database Password** section
5. If you need to reset it, click "Reset password"

### Step 2: Update .env File

Edit `medimanager/.env`:

```
SPRING_DATASOURCE_PASSWORD=YOUR_ACTUAL_DATABASE_PASSWORD_HERE
```

Replace `YOUR_ACTUAL_DATABASE_PASSWORD_HERE` with your actual password.

### Step 3: Set Environment Variables (for Spring Boot)

**Option A: Using .env file (automatic with IDE)**
The `.env` file is already created. Most IDEs will auto-load it.

**Option B: Set system environment variables**

On Windows (PowerShell):
```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
$env:SUPABASE_ANON_KEY="your_anon_key_here"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://YOUR_DB_HOST:5432/postgres"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="your_password_here"
```

On Linux/Mac (Bash):
```bash
export SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key_here"
export SPRING_DATASOURCE_URL="jdbc:postgresql://YOUR_DB_HOST:5432/postgres"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="your_password_here"
```

`YOUR_DB_HOST` must be copied from Supabase Database settings (Connection string host). If DNS lookup fails (`UnknownHostException`), verify the host value and do not prepend `db.` unless Supabase explicitly provides it.

## Running with Supabase

### Build Backend
```bash
cd medimanager
mvn clean install
```

### Run Backend
```bash
mvn spring-boot:run
```

The application will:
1. Connect to your Supabase PostgreSQL database
2. Auto-create tables (users, prescriptions, medications)
3. Run on `http://localhost:8080`

### Run Frontend
```bash
cd mediui
npm run dev
```

Frontend will run on `http://localhost:5173`

## Verify Connection

### Check Database Connection

You can verify the connection by:

1. **Check Application Logs**
   - Look for successful connection message
   - No errors about database connection

2. **Test API Endpoints**
   - Go to http://localhost:5173
   - Create a test user (signup)
   - Login
   - Create a prescription

3. **Verify in Supabase**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Open the **SQL Editor**
   - Run: `SELECT * FROM users;`
   - You should see your test data

## Database Structure

Your Supabase database will have these tables:

### users
```sql
id (UUID) - Primary Key
name (VARCHAR)
email (VARCHAR) - Unique
password (VARCHAR)
role (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### prescriptions
```sql
id (BIGINT) - Primary Key
patient_id (VARCHAR)
doctor_id (BIGINT) - Foreign Key
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### medications
```sql
id (BIGINT) - Primary Key
name (VARCHAR)
dosage (VARCHAR)
duration (VARCHAR)
timing (VARCHAR)
notes (VARCHAR)
prescription_id (BIGINT) - Foreign Key
```

## Troubleshooting

### "Connection refused"
- Check database password in `.env` is correct
- Verify Supabase project is running
- Check firewall/network access

### "No tables created"
- Wait a few seconds on first run
- Check Supabase dashboard to see if tables exist
- Check application logs for errors

### "Authentication failed"
- Verify `SPRING_DATASOURCE_USERNAME` is `postgres`
- Check `SPRING_DATASOURCE_PASSWORD` is correct
- Ensure database URL is correct

## File Changes Summary

```
medimanager/
├── pom.xml                           (Updated - PostgreSQL driver)
├── .env                              (New - Supabase credentials)
├── src/main/resources/
│   └── application.properties        (Updated - Supabase config)
└── src/main/java/com/example/medimanager/
    └── config/
        └── SupabaseConfig.java       (New - Supabase config class)
```

## Next Steps

1. Update `.env` with your database password
2. Run backend: `mvn spring-boot:run`
3. Run frontend: `npm run dev`
4. Test the application
5. Check Supabase dashboard to see data

## Security Notes

✅ Your Supabase credentials are now in `.env` (for local development)

⚠️ Before production:
- Move credentials to environment variables (not in code)
- Use different keys for different environments
- Enable Row Level Security (RLS) in Supabase
- Implement proper authentication

## Support

For Supabase help:
- Docs: https://supabase.com/docs
- Support: https://supabase.com/support
- Dashboard: https://supabase.com/dashboard
