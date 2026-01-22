# Doctor Prescription Creation - Testing Guide

## Overview
Testing the complete prescription workflow: Doctor creates prescription → System stores it → Doctor can view and renew it

## Phase 1: Test Flow

### Step 1: Login as Doctor
1. Navigate to http://localhost:5173/
2. Sign up or login with doctor credentials:
   - Email: `doctor@test.com` (or create new)
   - Password: `test123`
   - Role: Select DOCTOR during signup

### Step 2: Create a Patient
Go to the Doctor Prescriptions page:
1. In the "Add patient" form, fill:
   - Full name: `John Doe`
   - Email: `patient1@test.com`
   - Temporary password: `patient123`
   - Age: `35`
   - Gender: `MALE`
2. Click "Create patient"
3. Verify: Patient appears in the dropdown below

### Step 3: Create a Prescription
1. In "Create prescription" form, select:
   - Patient: `John Doe (patient1@test.com)`
   - Diagnosis: `Hypertension`
   - Expiry date: Pick a date 3 months from now
2. Add medications:
   - Medicine 1:
     - Name: `Lisinopril`
     - Dosage: `10mg`
     - Timing: `Once daily in morning`
     - Duration: `90 days`
     - Notes: `Take with food`
   - Click "Add medicine" and add more if needed
3. Click "Create prescription"
4. Verify: Prescription appears in "My prescriptions" list

### Step 4: View Prescriptions
- Check the "My prescriptions" section shows:
  - Diagnosis: `Hypertension`
  - Patient: `patient1@test.com`
  - Status: `ACTIVE`

### Step 5: Renew a Prescription
1. Click "Renew" button on any prescription
2. Verify: New prescription created with same diagnosis and medicines

## Expected Results

✅ Patient creation succeeds
✅ Prescription creation succeeds  
✅ Medications are saved with prescription
✅ Doctor can view their prescriptions
✅ Prescription renewal works
✅ Status shows correctly as ACTIVE

## Database Queries to Verify

Check backend logs or database:
```sql
-- Check prescriptions table
SELECT * FROM prescriptions WHERE doctor_id = (SELECT id FROM users WHERE email = 'doctor@test.com');

-- Check prescription medicines
SELECT * FROM prescription_medicines WHERE prescription_id IN (SELECT id FROM prescriptions WHERE doctor_id = (SELECT id FROM users WHERE email = 'doctor@test.com'));
```

## Known Issues to Check
- [ ] Medications not saved with prescription
- [ ] Expiry date defaults not working
- [ ] Status not showing correctly
- [ ] Foreign key errors on prescription deletion

## Next Steps
After successful testing:
1. Implement patient prescription viewing
2. Add patient prescription tracking features
3. Build pharmacist inventory integration
