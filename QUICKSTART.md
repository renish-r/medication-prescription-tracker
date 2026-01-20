# Quick Start Guide

## Run Both Services

### Terminal 1 - Start Backend (Spring Boot)

```bash
cd medimanager
mvn spring-boot:run
```

Expected output:
```
[INFO] Attaching agents: []
...
Tomcat started on port(s): 8080 (http)
```

### Terminal 2 - Start Frontend (React + Vite)

```bash
cd mediui
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You'll see the Medication & Prescription Tracker splash screen
3. After 3 seconds, the login page will appear

## Test the Application

### Create a Test Account

1. Click "Don't have an account? Create one"
2. Fill in the signup form:
   - Name: `Dr. John Smith`
   - Email: `doctor@example.com`
   - Password: `password123`
   - Role: `Doctor`
3. Click "Sign Up"

### Login with the Test Account

1. Enter the email and password
2. Select the role: `Doctor`
3. Click "Login"

### Test Doctor Features

1. Enter a Patient ID: `P001`
2. Click "+ Add Medication"
3. Fill in medication details:
   - Medicine Name: `Aspirin`
   - Dosage: `500mg`
   - Duration: `5 days`
   - Timing: `Morning`
   - Notes: `After food`
4. Click "Save Prescription"

## Troubleshooting

### Backend won't start
- Check Java version: `java -version` (should be 21+)
- Check Maven: `mvn -v`
- Clear Maven cache: `mvn clean`

### Frontend won't start
- Check Node.js: `node -v` (should be 16+)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -r node_modules && npm install`

### CORS errors in browser console
- Ensure backend is running on `http://localhost:8080`
- Check that the API_URL in App.jsx is correct: `http://localhost:8080/api`

### Database errors
- H2 console is available at `http://localhost:8080/h2-console`
- Default connection string: `jdbc:h2:mem:medimanagerdb`
- Username: `sa`
- Leave password empty

## File Locations

- Frontend code: `mediui/src/`
- Backend code: `medimanager/src/main/java/com/example/medimanager/`
- API configuration: `mediui/src/App.jsx` (line with `const API_URL`)
- Database config: `medimanager/src/main/resources/application.properties`

## Next Steps

1. Add authentication/JWT tokens
2. Hash passwords with BCrypt
3. Add form validation
4. Implement medication reminders
5. Add file upload for prescriptions
6. Create admin dashboard
