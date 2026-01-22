# Phase 2 Testing Guide - Password & Profile Management

## Pre-requisites
1. Backend running on http://localhost:8080
2. Frontend running on http://localhost:5173
3. User accounts created (Patient, Doctor, Pharmacist)
4. JWT tokens available for testing

## Test Scenarios

### Scenario 1: Password Change (Authenticated User)

**Prerequisites:**
- User is logged in
- Valid JWT token in localStorage

**Steps:**
1. Click "Password" in the top navigation
2. Enter current password
3. Enter new password (minimum 6 characters)
4. Confirm new password
5. Click "Change Password" button

**Expected Results:**
- ✅ Form validates password confirmation match
- ✅ Form validates minimum length (6 characters)
- ✅ API receives valid Bearer token
- ✅ Backend validates old password
- ✅ Backend returns success message
- ✅ Frontend shows "Password changed successfully!" message
- ✅ Password can be used for next login

**Error Cases to Test:**
- Enter mismatched passwords → Shows "Passwords do not match"
- Enter password < 6 characters → Shows "Password must be at least 6 characters"
- Enter incorrect old password → Shows error from backend
- No token in localStorage → Request rejected with 401

### Scenario 2: Profile Editing - Patient

**Prerequisites:**
- Patient user is logged in
- Valid JWT token in localStorage

**Steps:**
1. Click "Profile" in the top navigation
2. View email and role displayed
3. Update the following fields:
   - Name: Change to test name
   - Age: Enter age (e.g., 30)
   - Gender: Select from dropdown
   - Phone Number: Enter phone
   - Address: Enter address
   - Blood Group: Select from dropdown
   - Medical History: Enter medical history
4. Click "Save Profile" button

**Expected Results:**
- ✅ Profile page loads with current data
- ✅ Email and Role displayed correctly
- ✅ All patient-specific fields are visible
- ✅ All fields are editable
- ✅ Dropdown fields work (Gender, Blood Group)
- ✅ Text area for address and medical history resizes properly
- ✅ Submit sends PUT request to /api/profile/patient
- ✅ Backend returns success message
- ✅ Frontend shows "Profile updated successfully!" message
- ✅ Data persists after page reload

**Error Cases:**
- No token → 401 error
- Patient accessing doctor profile endpoint → 403 error
- Invalid data → Backend validation error

### Scenario 3: Profile Editing - Doctor

**Prerequisites:**
- Doctor user is logged in
- Valid JWT token in localStorage

**Steps:**
1. Click "Profile" in the top navigation
2. Update doctor-specific fields:
   - Name: Change to test name
   - Specialization: Enter specialization (e.g., "Cardiology")
   - License Number: Enter license
   - Phone Number: Enter phone
   - Clinic Address: Enter address
   - Years of Experience: Enter number
3. Click "Save Profile" button

**Expected Results:**
- ✅ Only doctor-specific fields are shown
- ✅ Patient fields (Age, Blood Group, etc.) are NOT shown
- ✅ All fields save successfully
- ✅ Submit sends PUT request to /api/profile/doctor
- ✅ Backend returns success message
- ✅ Data persists after reload

### Scenario 4: Profile Editing - Pharmacist

**Prerequisites:**
- Pharmacist user is logged in
- Valid JWT token in localStorage

**Steps:**
1. Click "Profile" in the top navigation
2. Update pharmacist-specific fields:
   - Name: Change to test name
   - Pharmacy Name: Enter pharmacy name
   - License Number: Enter license
   - Phone Number: Enter phone
   - Address: Enter address
3. Click "Save Profile" button

**Expected Results:**
- ✅ Only pharmacist-specific fields are shown
- ✅ Patient and Doctor fields are NOT shown
- ✅ All fields save successfully
- ✅ Submit sends PUT request to /api/profile/pharmacist
- ✅ Backend returns success message

### Scenario 5: Forgot Password - Step 1 (Email Entry)

**Prerequisites:**
- User is not logged in
- On login page

**Steps:**
1. Click "Forgot Password" link
2. Enter email address of an existing user
3. Click "Send Reset Link" button

**Expected Results:**
- ✅ ForgotPassword component loads
- ✅ Email input field is visible and editable
- ✅ Submit button shows "Send Reset Link"
- ✅ API receives POST request to /api/auth/forgot-password
- ✅ Success message shown (doesn't reveal if email exists)
- ✅ After 1.5 seconds, transitions to password reset form
- ✅ Email is pre-filled in next step

**Error Cases:**
- Enter non-existent email → Still shows success message (security)
- Empty email field → Form validation error
- Invalid email format → Form validation error

### Scenario 6: Forgot Password - Step 2 (Password Reset)

**Prerequisites:**
- Completed Step 1 of forgot password
- On reset password form

**Steps:**
1. Enter new password (minimum 6 characters)
2. Confirm password (must match)
3. Click "Reset Password" button

**Expected Results:**
- ✅ Email is displayed (read-only)
- ✅ New password field is visible
- ✅ Confirm password field is visible
- ✅ Form validates password confirmation
- ✅ Form validates minimum length
- ✅ API receives POST request to /api/auth/reset-password
- ✅ Backend processes reset
- ✅ Success message shown
- ✅ After 2 seconds, redirects to login page
- ✅ New password can be used to log in

**Error Cases:**
- Mismatched passwords → Shows "Passwords do not match"
- Password < 6 characters → Shows "Password must be at least 6 characters"
- Non-existent email → Backend returns error

### Scenario 7: Navigation Links Display

**When NOT Logged In:**
- ✅ "Login" link visible
- ✅ "Forgot Password" link visible
- ✅ "Sign up" link visible (filled button)
- ✅ "Profile" link NOT visible
- ✅ "Password" link NOT visible

**When Logged In:**
- ✅ "Login" link NOT visible
- ✅ "Sign up" link NOT visible
- ✅ "Forgot Password" link NOT visible
- ✅ "Profile" link visible
- ✅ "Password" link visible
- ✅ Role badge visible
- ✅ Email visible
- ✅ "Logout" button visible

### Scenario 8: Authorization Testing

**Test Role-Based Access Control:**

1. **Patient accessing Doctor profile endpoint:**
   - Login as Patient
   - Try to manually call PUT /api/profile/doctor with Doctor data
   - Expected: 403 Forbidden error

2. **Doctor accessing Patient profile endpoint:**
   - Login as Doctor
   - Try to call PUT /api/profile/patient
   - Expected: 403 Forbidden error

3. **Unauthenticated user accessing protected endpoints:**
   - Do not log in
   - Try to call GET /api/profile
   - Expected: 401 Unauthorized error

4. **Invalid token:**
   - Log in
   - Manually modify token in localStorage
   - Try to access profile
   - Expected: 401 Unauthorized error

### Scenario 9: Loading and Saving States

**Test UI States:**

1. **Profile Loading:**
   - Click Profile link
   - Expected: Shows "Loading..." initially
   - Then displays profile data

2. **Profile Saving:**
   - Change profile data
   - Click Save
   - Expected: Button shows "Saving..."
   - Button is disabled during save
   - Success message appears

3. **Password Changing:**
   - Fill password form
   - Click Change Password
   - Expected: Button shows "Updating..."
   - Button is disabled during request
   - Success message appears

4. **Forgot Password:**
   - Click Send Reset Link
   - Expected: Button shows "Sending..."
   - Button is disabled
   - Transitions to reset form

## Automated Testing Checklist

### Backend API Tests
- [ ] POST /api/auth/forgot-password - valid email
- [ ] POST /api/auth/forgot-password - invalid email
- [ ] POST /api/auth/forgot-password - no email
- [ ] POST /api/auth/reset-password - valid data
- [ ] POST /api/auth/reset-password - mismatched passwords
- [ ] POST /api/auth/reset-password - short password
- [ ] PUT /api/auth/change-password - valid change (authenticated)
- [ ] PUT /api/auth/change-password - wrong old password
- [ ] PUT /api/auth/change-password - no authentication
- [ ] GET /api/profile - authenticated
- [ ] GET /api/profile - not authenticated
- [ ] PUT /api/profile/patient - patient data (as patient)
- [ ] PUT /api/profile/patient - (as doctor) should 403
- [ ] PUT /api/profile/doctor - doctor data (as doctor)
- [ ] PUT /api/profile/doctor - (as patient) should 403
- [ ] PUT /api/profile/pharmacist - pharmacist data (as pharmacist)
- [ ] PUT /api/profile/pharmacist - (as patient) should 403

### Frontend Component Tests
- [ ] ChangePassword component renders correctly
- [ ] ChangePassword form validation works
- [ ] ChangePassword password confirmation check
- [ ] ChangePassword sends correct API request
- [ ] ChangePassword shows success/error messages
- [ ] ForgotPassword Step 1 renders
- [ ] ForgotPassword Step 1 transitions to Step 2
- [ ] ForgotPassword Step 2 renders with email
- [ ] ForgotPassword Step 2 validation works
- [ ] ForgotPassword success redirects to login
- [ ] ProfileEditor loads user data
- [ ] ProfileEditor shows correct fields for role
- [ ] ProfileEditor patient fields are correct
- [ ] ProfileEditor doctor fields are correct
- [ ] ProfileEditor pharmacist fields are correct
- [ ] ProfileEditor sends correct PUT request
- [ ] ProfileEditor shows success/error messages
- [ ] App.jsx routes all work correctly
- [ ] Navigation links show/hide based on auth state

## Performance Testing

- [ ] Profile page loads in < 2 seconds
- [ ] Profile save completes in < 3 seconds
- [ ] Password change completes in < 2 seconds
- [ ] Forgot password step 1 completes in < 2 seconds
- [ ] Forgot password step 2 completes in < 3 seconds
- [ ] No memory leaks during rapid form changes

## Security Testing

- [ ] Passwords are never logged in console
- [ ] Bearer tokens used for authenticated requests
- [ ] CORS headers handled correctly
- [ ] Invalid tokens rejected
- [ ] Role-based access enforced
- [ ] SQL injection attempts blocked
- [ ] XSS attempts prevented (React escaping)

## Browser Compatibility

Test on:
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile browsers (iPhone Safari, Chrome Mobile)

## Accessibility Testing

- [ ] All form labels present
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Color contrast meets WCAG standards
