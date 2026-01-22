#!/usr/bin/env node

/**
 * Automated test for prescription creation workflow
 * Run: node test-prescription.js
 */

const BASE_URL = 'http://localhost:8080/api';

async function request(method, path, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${path}`, options);
  const text = await response.text();
  
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch (e) {
    return { status: response.status, data: text };
  }
}

async function test() {
  console.log('🧪 Starting Prescription Creation Test...\n');

  try {
    // 1. Skip admin - directly test doctor and patient flow
    console.log('1️⃣  Skipping admin creation - testing doctor flow directly...\n');

    // 2. Create doctor account via signup
    console.log('2️⃣  Creating doctor account...');
    const doctorEmail = `doctor${Date.now()}@test.com`;
    const doctorSignup = await request('POST', '/auth/signup', {
      email: doctorEmail,
      password: 'doctor123',
      role: 'DOCTOR',
    });
    
    if (doctorSignup.status !== 201 && doctorSignup.status !== 200) {
      console.log('❌ Doctor creation failed:');
      console.log('Status:', doctorSignup.status);
      console.log('Response:', doctorSignup.data);
      return;
    }
    const doctorToken = doctorSignup.data.token;
    console.log('✅ Doctor account created\n');

    // 3. Create patient account
    console.log('3️⃣  Creating patient via doctor endpoint...');
    const patientEmail = `patient${Date.now()}@test.com`;
    const patientRes = await request('POST', '/doctor/patients', {
      name: 'John Doe',
      email: patientEmail,
      password: 'patient123',
      age: 35,
      gender: 'MALE',
    }, doctorToken);
    
    if (patientRes.status !== 200) {
      console.log('❌ Patient creation failed:', patientRes.data);
      return;
    }
    const patientId = patientRes.data.patientId;
    console.log(`✅ Patient created (ID: ${patientId})\n`);

    // 4. Create prescription
    console.log('4️⃣  Creating prescription...');
    const prescriptionRes = await request('POST', '/doctor/prescriptions/create', {
      patientId: patientId,
      diagnosis: 'Hypertension',
      expiryDate: '2026-04-21',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          timing: 'Once daily',
          duration: '90 days',
          notes: 'Take with food'
        },
        {
          name: 'Aspirin',
          dosage: '100mg',
          timing: 'Once daily',
          duration: '90 days',
          notes: 'After breakfast'
        }
      ]
    }, doctorToken);
    
    if (prescriptionRes.status !== 200) {
      console.log('❌ Prescription creation failed:', prescriptionRes.data);
      return;
    }
    const prescriptionId = prescriptionRes.data.prescriptionId;
    console.log(`✅ Prescription created (ID: ${prescriptionId})\n`);

    // 5. Get doctor's prescriptions
    console.log('5️⃣  Fetching doctor\'s prescriptions...');
    const myPresRes = await request('GET', '/doctor/prescriptions', null, doctorToken);
    
    if (myPresRes.status !== 200) {
      console.log('❌ Failed to fetch prescriptions:', myPresRes.data);
      return;
    }
    console.log(`✅ Found ${myPresRes.data.length} prescriptions`);
    const pres = myPresRes.data.find(p => p.id === prescriptionId);
    if (pres) {
      console.log(`   - Diagnosis: ${pres.diagnosis}`);
      console.log(`   - Patient ID: ${pres.patient?.id}`);
      console.log(`   - Status: ${pres.status}`);
      console.log(`   - Medicines: ${pres.medicines?.length || 0}`);
    }
    console.log();

    // 6. Renew prescription
    console.log('6️⃣  Renewing prescription...');
    const renewRes = await request('POST', `/doctor/prescriptions/${prescriptionId}/renew`, {}, doctorToken);
    
    if (renewRes.status !== 200) {
      console.log('❌ Renewal failed:', renewRes.data);
      return;
    }
    console.log(`✅ Prescription renewed (New ID: ${renewRes.data.newPrescriptionId})\n`);

    // 7. Get prescriptions again
    console.log('7️⃣  Fetching updated prescriptions...');
    const finalPresRes = await request('GET', '/doctor/prescriptions', null, doctorToken);
    console.log(`✅ Total prescriptions: ${finalPresRes.data.length}`);
    console.log(`   - Original status: ${myPresRes.data.find(p => p.id === prescriptionId)?.status}`);
    console.log(`   - New prescription exists: ${!!finalPresRes.data.find(p => p.id === renewRes.data.newPrescriptionId)}`);
    console.log();

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

test();
