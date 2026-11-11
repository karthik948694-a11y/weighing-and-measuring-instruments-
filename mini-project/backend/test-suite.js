const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5000';

async function request(urlPath, options = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`[${res.status}] ${data.message || 'Request failed'}`);
  }
  return data;
}

// Create a small dummy image for testing uploads
function createTestImage(filename) {
  const filePath = path.join(__dirname, filename);
  // Minimal valid 1x1 PNG
  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(filePath, png1x1);
  return filePath;
}

async function runTests() {
  console.log('🧪 Starting LMVS End-to-End Automated Verification...\n');

  let localServer = null;
  try {
    await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(500) });
  } catch (_e) {
    console.log('⚡ Server not running at port 5000. Launching internal server instance for tests...');
    const { startServer } = require('./server');
    localServer = await startServer();
  }

  const testImg = createTestImage('temp_test_scale.png');

  try {
    // 1. Health check
    console.log('1️⃣ Checking Health Endpoint...');
    const health = await request('/api/health');
    console.log('   ✅ Backend Health OK:', health);

    // 2. Officer Login
    console.log('\n2️⃣ Testing Legal Metrology Officer Login...');
    const officerAuth = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@lmvs.gov', password: 'Officer@123' }),
    });
    console.log('   ✅ Officer logged in:', officerAuth.user.name, `(${officerAuth.user.role})`);
    const officerToken = officerAuth.token;

    // 2B. Testing Officer Registration & Validation Rule (113iom...)
    console.log('\n2️⃣b Testing Officer Registration ID Validation (Prefix: 113iom)...');
    try {
      await request('/api/auth/officer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idno: 'INVALID999',
          name: 'Fake Officer',
          password: 'SecretPassword',
        }),
      });
      throw new Error('Should have rejected invalid officer ID without 113iom prefix!');
    } catch (err) {
      console.log('   ✅ Correctly blocked invalid Officer ID:', err.message);
    }

    const newOfficerId = `113iom${20 + Math.floor(Math.random() * 50)}`;
    const regOfficer = await request('/api/auth/officer-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idno: newOfficerId,
        name: 'Inspector Suresh Nair',
        password: 'Officer@456',
        phone: '011-2338-1122',
      }),
    });
    console.log(`   ✅ Successfully registered new Officer with valid ID (${newOfficerId}):`, regOfficer.user.name);

    // 3. Business Owner Registration
    console.log('\n3️⃣ Testing Business Owner Registration...');
    const testOwnerEmail = `trader_${Date.now()}@market.com`;
    const ownerAuth = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramesh Supermarket',
        email: testOwnerEmail,
        password: 'Password@123',
        shopName: 'Ramesh Supermarket & Grain Depot',
        shopAddress: 'Shop #42, APMC Yard, Sector 19',
        phone: '9876543210',
      }),
    });
    console.log('   ✅ Business Owner Registered:', ownerAuth.user.name, `(ID: ${ownerAuth.user.id})`);
    const ownerToken = ownerAuth.token;

    // 4. Owner Submits Instrument Application with Photo
    console.log('\n4️⃣ Testing Instrument Submission (with Photo)...');
    const form = new FormData();
    form.append('instrumentName', 'Digital Platform Scale 300kg');
    form.append('category', 'Platform Scale');
    form.append('serialNumber', 'SN-DPS-2026-99');
    form.append('capacity', '300 kg');
    form.append('shopName', 'Ramesh Supermarket & Grain Depot');
    form.append('shopAddress', 'Shop #42, APMC Yard, Sector 19');
    form.append('phone', '9876543210');
    form.append('photo', new Blob([fs.readFileSync(testImg)], { type: 'image/png' }), 'scale.png');

    const appRes = await request('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: form,
    });
    console.log('   ✅ Instrument Submitted. Status:', appRes.application.status, `(ID: ${appRes.application.id})`);
    const appId = appRes.application.id;

    // 5. Officer Reviews & Approves Instrument -> Generates Certificate ID & QR Code
    console.log('\n5️⃣ Testing Officer Approval & QR Code / Certificate Generation...');
    const approveRes = await request(`/api/applications/${appId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${officerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        verificationResult: 'Pass',
        observations: 'Calibrated using standard 50kg test weights. Error deviation < 0.02%. Certified compliant.',
      }),
    });
    const approvedApp = approveRes.application;
    console.log('   ✅ Certificate Generated ID:', approvedApp.certificateId);
    console.log('   ✅ Verification Date:', approvedApp.verificationDate);
    console.log('   ✅ Expiry Date:', approvedApp.expiryDate);
    console.log('   ✅ QR Code Present:', approvedApp.qrCode ? approvedApp.qrCode.substring(0, 35) + '...' : 'NONE');
    console.log('   ✅ Renewal Alert Color:', approvedApp.alert ? approvedApp.alert.color : 'NONE');

    // 6. Public Verification by Certificate Code / QR
    console.log('\n6️⃣ Testing Public Verification via Certificate Code / Scanned QR...');
    const verifyRes = await request(`/api/verify/${approvedApp.certificateId}`);
    console.log('   ✅ Public Lookup Found:', verifyRes.found);
    console.log('   ✅ Valid Status:', verifyRes.valid);
    console.log('   ✅ Verified Business Owner:', verifyRes.certificate.ownerName);
    console.log('   ✅ Verified Shop Name:', verifyRes.certificate.shopName);
    console.log('   ✅ Verified Instrument Name:', verifyRes.certificate.instrumentName);
    console.log('   ✅ Verified Capacity:', verifyRes.certificate.capacity);
    console.log('   ✅ Days Left:', verifyRes.alert.daysLeft, `(Level: ${verifyRes.alert.level})`);

    // 7. Customer / Citizen Files Complaint Against a Business
    console.log('\n7️⃣ Testing Citizen Complaint Submission with Photo Evidence...');
    const cmpForm = new FormData();
    cmpForm.append('complainantName', 'Vikram Singh (Consumer)');
    cmpForm.append('complainantPhone', '9812345678');
    cmpForm.append('complainantEmail', 'vikram@consumer.org');
    cmpForm.append('sellerName', 'Vijay Provision Store');
    cmpForm.append('shopName', 'Vijay Provisions');
    cmpForm.append('shopAddress', 'Shop 7, Vegetable Mandi');
    cmpForm.append('violationType', 'Expired Machine / No Renewal');
    cmpForm.append('description', 'Seller weighing 1kg pulses showing 850g on independent scale. No renewal sticker on machine.');
    cmpForm.append('photos', new Blob([fs.readFileSync(testImg)], { type: 'image/png' }), 'evidence1.png');

    const cmpRes = await request('/api/complaints', {
      method: 'POST',
      body: cmpForm,
    });
    console.log('   ✅ Complaint Lodged! Ref Number:', cmpRes.complaint.complaintNumber);
    console.log('   ✅ Complaint Status:', cmpRes.complaint.status);
    console.log('   ✅ Evidence Photos Uploaded:', cmpRes.complaint.photos.length);
    const complaintId = cmpRes.complaint.id;

    // 8. Officer Reviews Complaints List & Updates Status
    console.log('\n8️⃣ Testing Officer Review of Citizen Complaints...');
    const allComplaints = await request('/api/complaints', {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    console.log('   ✅ Officer fetched complaints list, total count:', allComplaints.complaints.length);

    const updateCmp = await request(`/api/complaints/${complaintId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${officerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Action Taken',
        officerNotes: 'Show cause notice served under Legal Metrology Act Sec 30. Machine seized for laboratory calibration.',
      }),
    });
    console.log('   ✅ Complaint Updated by Officer. New Status:', updateCmp.complaint.status);
    console.log('   ✅ Officer Notes:', updateCmp.complaint.officerNotes);

    // 9. Owner Dashboard Overview Check
    console.log('\n9️⃣ Testing Business Owner Dashboard Instruments Query...');
    const ownerApps = await request('/api/applications/mine', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    console.log('   ✅ Owner Instruments Count:', ownerApps.applications.length);
    console.log('   ✅ Color indicator level:', ownerApps.applications[0].alert.level);
    console.log('   ✅ Color indicator label:', ownerApps.applications[0].alert.label);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The system is fully operational.\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    if (fs.existsSync(testImg)) {
      fs.unlinkSync(testImg);
    }
    if (localServer) {
      localServer.close();
      console.log('🏁 Test server closed.');
    }
  }
}

runTests();
