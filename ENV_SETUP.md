# Environment Variables Setup

## Overview
Sensitive configuration has been moved to `.env` files for security. These files are git-ignored and should never be committed to version control.

## Backend Setup (medimanager/)

### 1. Create .env file
Copy `.env.example` to `.env` in the `medimanager/` directory:
```bash
cp .env.example .env
```

### 2. Configure your environment variables
Edit `.env` with your actual values:

```env
# Database Configuration
DB_URL=jdbc:postgresql://your-db-host:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=your-actual-password

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-secret-key-min-256-bits
JWT_EXPIRATION=86400000

# Server Port
PORT=8080
```

### 3. How it works
- The `MedimanagerApplication.java` loads the `.env` file on startup
- Spring Boot's `application.properties` reads these values using `${VARIABLE_NAME}` syntax
- If `.env` is missing, the app falls back to system environment variables

## Frontend Setup (mediui/)

### 1. Create .env file
Copy `.env.example` to `.env` in the `mediui/` directory:
```bash
cp .env.example .env
```

### 2. Configure your environment variables
Edit `.env`:

```env
# Backend API URL
VITE_API_BASE=http://localhost:8080/api
```

### 3. How it works
- Vite automatically loads `.env` files
- Access variables in code with `import.meta.env.VITE_API_BASE`
- Variables must be prefixed with `VITE_` to be exposed to the client

## Security Notes

✅ **What's protected:**
- `.env` files are in `.gitignore`
- Actual credentials are never committed
- `.env.example` files show structure without sensitive values

⚠️ **Important:**
- Never commit `.env` files
- Keep `.env.example` updated with new variables (without actual values)
- Share credentials securely (e.g., password managers, secure notes)

## Running the Application

### Backend:
```bash
cd medimanager
./mvnw spring-boot:run
```

### Frontend:
```bash
cd mediui
npm install
npm run dev
```

## Deployment

For production:
1. Set environment variables directly on your hosting platform (Heroku, AWS, etc.)
2. Don't rely on `.env` files in production
3. Use platform-specific secret management tools
