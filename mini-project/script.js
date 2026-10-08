/**
 * Legal Metrology Verification System (LMVS) - Client Runtime
 * Standalone Client-Side Architecture (Zero Database / No MongoDB Required)
 */

const STORAGE_KEYS = {
  TOKEN: 'lmvs_token',
  USER: 'lmvs_user',
  USERS_DB: 'lmvs_db_users',
  APPS_DB: 'lmvs_db_applications',
  COMPLAINTS_DB: 'lmvs_db_complaints',
};

// ----------------------------------------------------
// 1. INITIAL SEED DATA (Local in-browser Database)
// ----------------------------------------------------
function initLocalStorageDatabase() {
  // Seed Users
  if (!localStorage.getItem(STORAGE_KEYS.USERS_DB)) {
    const initialUsers = [
      {
        id: 'usr_officer_01',
        name: 'Legal Metrology Officer',
        email: 'officer@lmvs.gov',
        password: 'Officer@123',
        role: 'Officer',
        shopName: 'Legal Metrology Enforcement Division',
        shopAddress: 'District Administrative Complex, Room 104',
        phone: '011-2338-0000',
      },
      {
        id: 'usr_owner_01',
        name: 'Rajesh Sharma',
        email: 'owner@example.com',
        password: 'Owner@123',
        role: 'Owner',
        shopName: 'Rajesh Supermarket & Provision Mart',
        shopAddress: 'Shop #18, Main Commercial Complex, Market Yard',
        phone: '+91 98230 11223',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(initialUsers));
  }

  // Seed Sample Applications / Instruments
  if (!localStorage.getItem(STORAGE_KEYS.APPS_DB)) {
    const today = new Date();

    // Green (Valid for 300 days)
    const dateGreenVerif = new Date(today);
    dateGreenVerif.setDate(dateGreenVerif.getDate() - 65);
    const dateGreenExpiry = new Date(dateGreenVerif);
    dateGreenExpiry.setDate(dateGreenExpiry.getDate() + 365);
    const certGreen = 'CERT-2026-104921';

    // Yellow (Due soon - 12 days left)
    const dateYellowExpiry = new Date(today);
    dateYellowExpiry.setDate(dateYellowExpiry.getDate() + 12);
    const dateYellowVerif = new Date(dateYellowExpiry);
    dateYellowVerif.setDate(dateYellowVerif.getDate() - 365);
    const certYellow = 'CERT-2026-294810';

    // Red (Expired 28 days ago)
    const dateRedExpiry = new Date(today);
    dateRedExpiry.setDate(dateRedExpiry.getDate() - 28);
    const dateRedVerif = new Date(dateRedExpiry);
    dateRedVerif.setDate(dateRedVerif.getDate() - 365);
    const certRed = 'CERT-2025-983104';

    const initialApps = [
      {
        id: 'app_001',
        owner: 'usr_owner_01',
        ownerName: 'Rajesh Sharma',
        shopName: 'Rajesh Supermarket & Provision Mart',
        shopAddress: 'Shop #18, Main Commercial Complex, Market Yard',
        phone: '+91 98230 11223',
        instrumentName: 'Counter Scale Model CS-30',
        category: 'Counter Scale',
        serialNumber: 'CS30-2026-08',
        capacity: '30 kg',
        photo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
        status: 'Verified',
        certificateId: certGreen,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('http://localhost:5000/verify.html?code=' + certGreen)}`,
        verificationDate: dateGreenVerif.toISOString(),
        expiryDate: dateGreenExpiry.toISOString(),
        observations: 'Verified conforming to standard weights. Deviation < 0.01%. Official stamp affixed.',
        createdAt: dateGreenVerif.toISOString(),
      },
      {
        id: 'app_002',
        owner: 'usr_owner_01',
        ownerName: 'Rajesh Sharma',
        shopName: 'Rajesh Supermarket & Provision Mart',
        shopAddress: 'Shop #18, Main Commercial Complex, Market Yard',
        phone: '+91 98230 11223',
        instrumentName: 'Platform Weighing Machine 150kg',
        category: 'Platform Scale',
        serialNumber: 'PLT-150-774',
        capacity: '150 kg',
        photo: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80',
        status: 'Verified',
        certificateId: certYellow,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('http://localhost:5000/verify.html?code=' + certYellow)}`,
        verificationDate: dateYellowVerif.toISOString(),
        expiryDate: dateYellowExpiry.toISOString(),
        observations: 'Re-verification window open. Renewal application advised within 30 days.',
        createdAt: dateYellowVerif.toISOString(),
      },
      {
        id: 'app_003',
        owner: 'usr_owner_01',
        ownerName: 'Rajesh Sharma',
        shopName: 'Rajesh Supermarket & Provision Mart',
        shopAddress: 'Shop #18, Main Commercial Complex, Market Yard',
        phone: '+91 98230 11223',
        instrumentName: 'Heavy Weighbridge Unit #1',
        category: 'Weighbridge',
        serialNumber: 'WB-50T-2024',
        capacity: '50 Ton',
        photo: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=300&auto=format&fit=crop&q=80',
        status: 'Verified',
        certificateId: certRed,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('http://localhost:5000/verify.html?code=' + certRed)}`,
        verificationDate: dateRedVerif.toISOString(),
        expiryDate: dateRedExpiry.toISOString(),
        observations: 'EXPIRED! Continued commercial use without reverification is unlawful under Section 24.',
        createdAt: dateRedVerif.toISOString(),
      },
      {
        id: 'app_004',
        owner: 'usr_owner_01',
        ownerName: 'Rajesh Sharma',
        shopName: 'Rajesh Supermarket & Provision Mart',
        shopAddress: 'Shop #18, Main Commercial Complex, Market Yard',
        phone: '+91 98230 11223',
        instrumentName: 'High Precision Gold / Jewelry Balance',
        category: 'Electronic Weighing Scale',
        serialNumber: 'PREC-JB-009',
        capacity: '500 g (Accuracy 0.001g)',
        photo: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=300&auto=format&fit=crop&q=80',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.APPS_DB, JSON.stringify(initialApps));
  }

  // Seed Sample Complaints
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS_DB)) {
    const initialComplaints = [
      {
        id: 'cmp_001',
        complaintNumber: 'CMP-2026-849201',
        complainantName: 'Sunil Verma (Resident Consumer)',
        complainantPhone: '+91 98450 67890',
        complainantEmail: 'sunil.consumer@gmail.com',
        sellerName: 'Anil Gupta',
        shopName: 'Gupta Wholesale Groceries & Oil Depo',
        shopAddress: 'Shop #5, Subzi Mandi, Gate No. 2',
        violationType: 'Expired Machine / No Renewal',
        description: 'The shopkeeper is using an old uncalibrated mechanical scale with no valid stamp. When asked for certificate, he refused to show it. Pre-packaged 5kg bags weigh only 4.6kg.',
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
        ],
        status: 'Pending',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS_DB, JSON.stringify(initialComplaints));
  }
}

// Ensure database is initialized
initLocalStorageDatabase();

// ----------------------------------------------------
// 2. AUTHENTICATION & SESSION STATE HELPERS
// ----------------------------------------------------
function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  try {
    return data ? JSON.parse(data) : null;
  } catch (_e) {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// ----------------------------------------------------
// 3. LOCAL STORAGE DATA ACCESSORS
// ----------------------------------------------------
function getLocalUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
}
function saveLocalUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
}

function getLocalApps() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPS_DB) || '[]');
}
function saveLocalApps(apps) {
  localStorage.setItem(STORAGE_KEYS.APPS_DB, JSON.stringify(apps));
}

function getLocalComplaints() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLAINTS_DB) || '[]');
}
function saveLocalComplaints(complaints) {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS_DB, JSON.stringify(complaints));
}

function generateCertCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `CERT-${year}-${random}`;
}

function generateComplaintNum() {
  const random = Math.floor(100000 + Math.random() * 900000);
  const year = new Date().getFullYear();
  return `CMP-${year}-${random}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

// ----------------------------------------------------
// 4. STANDALONE CLIENT-SIDE API INTERCEPTOR
// ----------------------------------------------------
async function api(path, options = {}) {
  // Realistic brief response delay
  await new Promise((r) => setTimeout(r, 60));

  const method = (options.method || 'GET').toUpperCase();
  const user = getCurrentUser();

  // Extract Request Body
  let body = {};
  if (options.body instanceof FormData) {
    for (const [key, value] of options.body.entries()) {
      body[key] = value;
    }
  } else if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch (_e) {
      body = {};
    }
  } else if (options.body && typeof options.body === 'object') {
    body = options.body;
  }

  // 1. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const users = getLocalUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === (body.email || '').trim().toLowerCase() && u.password === body.password
    );
    if (!found) {
      throw new Error('Invalid email or password');
    }
    const { password, ...safeUser } = found;
    const token = 'client_token_' + btoa(JSON.stringify(safeUser));
    return { token, user: safeUser };
  }

  // 2. Auth: Register
  if (path === '/api/auth/register' && method === 'POST') {
    const users = getLocalUsers();
    const exists = users.find((u) => u.email.toLowerCase() === (body.email || '').trim().toLowerCase());
    if (exists) {
      throw new Error('An account with this email address already exists');
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      name: body.name,
      email: body.email.trim(),
      phone: body.phone,
      shopName: body.shopName,
      shopAddress: body.shopAddress,
      password: body.password,
      role: 'Owner',
    };
    users.push(newUser);
    saveLocalUsers(users);

    const { password, ...safeUser } = newUser;
    const token = 'client_token_' + btoa(JSON.stringify(safeUser));
    return { token, user: safeUser };
  }

  // 3. Applications: My Applications (Owner)
  if (path === '/api/applications/mine' && method === 'GET') {
    if (!user) throw new Error('Authentication required');
    const apps = getLocalApps().filter((a) => a.owner === user.id || a.ownerName === user.name);
    return {
      applications: apps.map((app) => ({
        ...app,
        alert: getRenewalStatus(app.expiryDate),
      })),
    };
  }

  // 4. Applications: Pending / All (Officer)
  if ((path === '/api/applications' || path === '/api/applications/pending') && method === 'GET') {
    const apps = getLocalApps().filter((a) => a.status === 'Pending');
    return { applications: apps };
  }

  // 5. Applications: Alerts / Verified (Officer)
  if (path === '/api/applications/alerts' && method === 'GET') {
    const apps = getLocalApps().filter((a) => a.status === 'Verified');
    return {
      applications: apps.map((app) => ({
        ...app,
        alert: getRenewalStatus(app.expiryDate),
      })),
    };
  }

  // 6. Applications: Stats (Officer)
  if (path === '/api/applications/stats' && method === 'GET') {
    const apps = getLocalApps();
    const verified = apps.filter((a) => a.status === 'Verified');
    const pending = apps.filter((a) => a.status === 'Pending');

    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    verified.forEach((a) => {
      const st = getRenewalStatus(a.expiryDate);
      if (st.level === 'green') greenCount++;
      else if (st.level === 'yellow') yellowCount++;
      else if (st.level === 'red') redCount++;
    });

    return {
      total: apps.length,
      verified: verified.length,
      pending: pending.length,
      expired: redCount,
      dueSoon: yellowCount,
      greenCount,
      yellowCount,
      redCount,
    };
  }

  // 7. Applications: Create (Owner)
  if (path === '/api/applications' && method === 'POST') {
    if (!user) throw new Error('Authentication required');
    const apps = getLocalApps();

    let photoData = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80';
    if (body.photo instanceof Blob) {
      const read = await readFileAsDataUrl(body.photo);
      if (read) photoData = read;
    } else if (typeof body.photo === 'string' && body.photo.length > 0) {
      photoData = body.photo;
    }

    const newApp = {
      id: 'app_' + Date.now(),
      owner: user.id,
      ownerName: user.name,
      shopName: body.shopName || user.shopName,
      shopAddress: body.shopAddress || user.shopAddress,
      phone: body.phone || user.phone,
      instrumentName: body.instrumentName,
      category: body.category,
      serialNumber: body.serialNumber || '',
      capacity: body.capacity || '',
      photo: photoData,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    apps.unshift(newApp);
    saveLocalApps(apps);
    return { application: newApp, message: 'Application submitted successfully' };
  }

  // 8. Applications: Renew (Owner)
  if (path.startsWith('/api/applications/') && path.endsWith('/renew') && method === 'POST') {
    const appId = path.split('/')[3];
    const apps = getLocalApps();
    const target = apps.find((a) => a.id === appId);
    if (!target) throw new Error('Instrument not found');

    const renewalApp = {
      ...target,
      id: 'app_' + Date.now(),
      status: 'Pending',
      certificateId: null,
      qrCode: null,
      verificationDate: null,
      expiryDate: null,
      observations: null,
      isRenewal: true,
      previousCertificateId: target.certificateId,
      createdAt: new Date().toISOString(),
    };

    apps.unshift(renewalApp);
    saveLocalApps(apps);
    return { application: renewalApp, message: 'Renewal submitted' };
  }

  // 9. Applications: Approve (Officer)
  if (path.startsWith('/api/applications/') && path.endsWith('/approve') && method === 'POST') {
    const appId = path.split('/')[3];
    const apps = getLocalApps();
    const app = apps.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    const certCode = generateCertCode();
    const today = new Date();
    const expiry = new Date(today);
    expiry.setDate(expiry.getDate() + 365);

    const verifyUrl = `${window.location.origin}/verify.html?code=${certCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verifyUrl)}`;

    app.status = 'Verified';
    app.certificateId = certCode;
    app.qrCode = qrCodeUrl;
    app.verificationDate = today.toISOString();
    app.expiryDate = expiry.toISOString();
    app.observations = body.observations || 'Verified conforming to standard weights. Deviation < 0.01%. Official stamp affixed.';

    saveLocalApps(apps);
    return { application: { ...app, alert: getRenewalStatus(app.expiryDate) }, message: 'Application approved successfully' };
  }

  // 10. Applications: Reject (Officer)
  if (path.startsWith('/api/applications/') && path.endsWith('/reject') && method === 'POST') {
    const appId = path.split('/')[3];
    const apps = getLocalApps();
    const app = apps.find((a) => a.id === appId);
    if (!app) throw new Error('Application not found');

    app.status = 'Rejected';
    app.observations = body.observations || 'Rejected by reviewing officer.';
    saveLocalApps(apps);
    return { application: app, message: 'Application rejected' };
  }

  // 11. Verify: Public Certificate Lookup
  if (path.startsWith('/api/verify/') && method === 'GET') {
    const code = decodeURIComponent(path.replace('/api/verify/', '')).trim();
    const apps = getLocalApps();
    const found = apps.find(
      (a) =>
        (a.certificateId && a.certificateId.toUpperCase() === code.toUpperCase()) ||
        (a.serialNumber && a.serialNumber.toUpperCase() === code.toUpperCase())
    );

    if (!found || found.status !== 'Verified') {
      throw new Error(`No active government verification certificate found for code "${code}".`);
    }

    const alert = getRenewalStatus(found.expiryDate);
    const valid = alert.level !== 'red';

    return {
      found: true,
      valid,
      certificate: {
        id: found.id,
        certificateId: found.certificateId,
        ownerName: found.ownerName,
        shopName: found.shopName,
        shopAddress: found.shopAddress,
        phone: found.phone,
        instrumentName: found.instrumentName,
        category: found.category,
        serialNumber: found.serialNumber,
        capacity: found.capacity,
        photo: found.photo,
        verificationDate: found.verificationDate,
        expiryDate: found.expiryDate,
        observations: found.observations,
        qrCode: found.qrCode,
      },
      alert,
    };
  }

  // 12. Complaints: Submit (Citizen)
  if (path === '/api/complaints' && method === 'POST') {
    const complaints = getLocalComplaints();
    const compNumber = generateComplaintNum();

    let uploadedPhotos = [];
    if (body.photos instanceof Blob) {
      const read = await readFileAsDataUrl(body.photos);
      if (read) uploadedPhotos.push(read);
    } else if (Array.isArray(body.photos)) {
      for (const p of body.photos) {
        if (p instanceof Blob) {
          const r = await readFileAsDataUrl(p);
          if (r) uploadedPhotos.push(r);
        } else if (typeof p === 'string') {
          uploadedPhotos.push(p);
        }
      }
    }

    if (uploadedPhotos.length === 0) {
      uploadedPhotos.push('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');
    }

    const newComplaint = {
      id: 'cmp_' + Date.now(),
      complaintNumber: compNumber,
      complainantName: body.complainantName,
      complainantPhone: body.complainantPhone,
      complainantEmail: body.complainantEmail || '',
      sellerName: body.sellerName,
      shopName: body.shopName,
      shopAddress: body.shopAddress,
      violationType: body.violationType,
      description: body.description,
      photos: uploadedPhotos,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    complaints.unshift(newComplaint);
    saveLocalComplaints(complaints);
    return { complaint: newComplaint, message: 'Complaint registered successfully' };
  }

  // 13. Complaints: List (Officer)
  if (path === '/api/complaints' && method === 'GET') {
    const complaints = getLocalComplaints();
    return { complaints };
  }

  // 14. Complaints: Update (Officer)
  if (path.startsWith('/api/complaints/') && method === 'PATCH') {
    const compId = path.replace('/api/complaints/', '');
    const complaints = getLocalComplaints();
    const comp = complaints.find((c) => c.id === compId || c.complaintNumber === compId);
    if (!comp) throw new Error('Complaint not found');

    if (body.status) comp.status = body.status;
    if (body.officerNotes) comp.officerNotes = body.officerNotes;

    saveLocalComplaints(complaints);
    return { complaint: comp, message: 'Complaint updated' };
  }

  // 15. Complaints: Track by Number (Citizen)
  if (path.startsWith('/api/complaints/track/') && method === 'GET') {
    const num = path.replace('/api/complaints/track/', '').trim();
    const complaints = getLocalComplaints();
    const comp = complaints.find((c) => c.complaintNumber.toUpperCase() === num.toUpperCase());
    if (!comp) throw new Error('No complaint found with reference: ' + num);
    return { complaint: comp };
  }

  // Fallback
  return { ok: true };
}

// ----------------------------------------------------
// 5. HELPER FUNCTIONS & UI UTILITIES
// ----------------------------------------------------
function fileUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80';
  return path;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

function getRenewalStatus(expiryDate) {
  if (!expiryDate) {
    return {
      level: 'pending',
      label: 'Pending Inspection',
      color: 'blue',
      badgeClass: 'status-pill-pending',
      borderClass: 'indicator-border-pending',
      daysLeft: null,
      message: 'Awaiting officer inspection',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    const overdue = Math.abs(daysLeft);
    return {
      level: 'red',
      label: `🔴 Expired (${overdue}d overdue)`,
      color: 'red',
      badgeClass: 'status-pill-red',
      borderClass: 'indicator-border-red',
      daysLeft,
      message: `Expired ${overdue} days ago. Unlawful to use!`,
    };
  }

  if (daysLeft <= 30) {
    return {
      level: 'yellow',
      label: `🟡 Renewal Due Soon (${daysLeft}d left)`,
      color: 'yellow',
      badgeClass: 'status-pill-yellow',
      borderClass: 'indicator-border-yellow',
      daysLeft,
      message: `Renewal window open (${daysLeft} days remaining)`,
    };
  }

  return {
    level: 'green',
    label: `🟢 Valid (${daysLeft}d left)`,
    color: 'green',
    badgeClass: 'status-pill-green',
    borderClass: 'indicator-border-green',
    daysLeft,
    message: `Compliant and certified (${daysLeft} days remaining)`,
  };
}

function extractCode(raw) {
  if (!raw) return '';
  const text = String(raw).trim();
  try {
    const url = new URL(text);
    return url.searchParams.get('code') || url.searchParams.get('certId') || text;
  } catch (_err) {
    const match = text.match(/CERT-[A-Z0-9-]+/i);
    return match ? match[0] : text;
  }
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeClasses = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  toast.className = `toast ${typeClasses[type] || 'toast-info'}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span class="font-bold text-base">${icons[type] || 'ℹ'}</span>
      <span>${escapeHtml(message)}</span>
    </div>
    <button type="button" class="ml-4 opacity-75 hover:opacity-100 font-bold">&times;</button>
  `;

  toast.querySelector('button').addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function renderNavbar(options = {}) {
  const { activePage = '' } = options;
  const user = getCurrentUser();

  const navClass = (name) =>
    activePage === name
      ? 'text-gold font-bold border-b-2 border-gold pb-0.5'
      : 'text-white/85 hover:text-gold transition-colors font-medium';

  let links = `
    <a href="index.html" class="${navClass('home')}">Home</a>
    <a href="verify.html" class="${navClass('verify')}">Scan & Verify</a>
    <a href="complaint.html" class="${navClass('complaint')}">File Complaint</a>
    <a href="chatbot.html" class="${navClass('chatbot')}">🤖 AI Assistant</a>
  `;

  if (user) {
    if (user.role === 'Owner') {
      links += `<a href="owner-dashboard.html" class="${navClass('owner')}">Seller Dashboard</a>`;
    } else if (user.role === 'Officer') {
      links += `<a href="officer-dashboard.html" class="${navClass('officer')}">Officer Dashboard</a>`;
    }
    links += `
      <div class="flex items-center gap-2 border-l border-white/20 pl-4 ml-2">
        <span class="text-xs bg-gold/20 text-gold border border-gold/40 px-2.5 py-1 rounded-full font-semibold">
          ${user.role === 'Officer' ? '👮 Officer' : '🏭 ' + escapeHtml(user.name.split(' ')[0])}
        </span>
        <a href="#" id="logoutBtn" class="text-xs text-white/70 hover:text-red-300 font-semibold transition-colors">Logout</a>
      </div>
    `;
  } else {
    links += `
      <a href="login.html" class="bg-gold hover:bg-gold-light text-navy font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shadow">
        Sign In / Register
      </a>
    `;
  }

  return `
    <nav class="bg-navy border-b border-navy-light sticky top-0 z-40 shadow-md">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-2 text-gold font-bold text-lg tracking-wide hover:opacity-95">
          <span class="text-2xl">⚖️</span>
          <span>LMVS <span class="text-white/70 font-normal text-xs block md:inline">| Legal Metrology Portal</span></span>
        </a>
        <button id="navToggle" type="button" class="md:hidden text-gold border border-gold/60 rounded px-2.5 py-1 text-sm focus:outline-none" aria-label="Toggle navigation">
          ☰
        </button>
        <div id="navMenu" class="hidden md:flex items-center gap-6 text-sm">
          ${links}
        </div>
      </div>
      <div id="navMobile" class="hidden md:hidden px-4 pb-4 flex flex-col gap-3 text-sm border-t border-white/10 pt-3 bg-navy">
        ${links}
      </div>
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="bg-navy text-white/80 py-8 text-sm mt-auto border-t border-navy-light">
      <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <div class="flex items-center gap-2 text-gold font-bold text-base mb-2">
            <span>⚖️ Legal Metrology Verification System</span>
          </div>
          <p class="text-xs text-white/70 leading-relaxed">
            Automating government verification of weighing and measuring instruments, issuing tamper-proof QR certificates, and empowering consumer grievance redressal.
          </p>
        </div>
        <div>
          <h4 class="text-gold font-semibold text-xs uppercase tracking-wider mb-2">Quick Navigation</h4>
          <ul class="text-xs space-y-1.5 text-white/70">
            <li><a href="index.html" class="hover:text-gold transition-colors">Home & Overview</a></li>
            <li><a href="verify.html" class="hover:text-gold transition-colors">Verify Certificate / Scan QR</a></li>
            <li><a href="complaint.html" class="hover:text-gold transition-colors">Report Non-Compliant Business</a></li>
            <li><a href="chatbot.html" class="hover:text-gold transition-colors">🤖 MetroBot AI Helpdesk</a></li>
            <li><a href="login.html" class="hover:text-gold transition-colors">Owner & Officer Login</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-gold font-semibold text-xs uppercase tracking-wider mb-2">Statutory Compliance</h4>
          <p class="text-xs text-white/70 leading-relaxed">
            Operated pursuant to the Legal Metrology Act &amp; General Rules. All commercial instruments must be reverified annually.
          </p>
          <div class="mt-3 flex items-center gap-2 text-[11px] text-gold/90 font-medium">
            <span>🔒 Official Legal Metrology Registry</span>
          </div>
        </div>
      </div>
      <div class="border-t border-white/10 pt-4 text-center text-xs text-white/50">
        Department of Consumer Affairs &bull; Legal Metrology &copy; ${new Date().getFullYear()} All Rights Reserved.
      </div>
    </footer>
  `;
}

function initNavbar(options = {}) {
  const container = document.getElementById('navbar-container');
  if (!container) return;
  container.innerHTML = renderNavbar(options);

  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => mobile.classList.toggle('hidden'));
  }

  const logoutBtns = document.querySelectorAll('#logoutBtn');
  logoutBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clearCurrentUser();
      showToast('Logged out successfully', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  });

  // Auto-mount embedded interactive Chatbot Widget on all pages
  initChatbotWidget();
}

// ----------------------------------------------------
// 6. METROBOT EMBEDDED CHAT WIDGET (ON EVERY PAGE)
// ----------------------------------------------------
const METROBOT_KB = [
  {
    patterns: [/\b(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|halo|helo)\b/i],
    responses: [
      "👋 Hello! Welcome to the <strong>Legal Metrology Verification System</strong>. I'm MetroBot, your automated assistant. How can I help you today?",
      "👋 Namaste! I'm MetroBot. Ask me anything about scale verification, certificate renewals, complaints, or regulations."
    ]
  },
  {
    patterns: [/\b(who are you|what are you|your name|introduce yourself|what is metrobot)\b/i],
    responses: [
      "I'm <strong>MetroBot</strong> 🤖 &mdash; an AI assistant for the <strong>Legal Metrology Department</strong>. I can help you with:<ul><li>🔍 Certificate verification</li><li>📝 Filing complaints</li><li>⚖️ Understanding stamping regulations</li><li>📅 Renewal timelines &amp; fees</li></ul>What would you like to know?"
    ]
  },
  {
    patterns: [/\b(what is legal metrology|legal metrology mean|about legal metrology|explain metrology)\b/i],
    responses: [
      "<strong>Legal Metrology</strong> ⚖️ is the branch of measurement science dealing with mandatory government standards.<br><br>In India, it ensures:<ul><li>Accuracy of weighing &amp; measuring instruments used in retail and industry</li><li>Protection of consumers from under-weight commodities</li><li>Mandatory annual certification &amp; stamping under the <strong>Legal Metrology Act, 2009</strong></li></ul>"
    ]
  },
  {
    patterns: [/\b(verify|verification|check|validate|certificate|cert)\b.*\b(how|steps|process|procedure|guide)\b|\b(how to|how do i|steps to|process for|procedure for)\b.*\b(verify|verification|check|validate|certificate)\b/i],
    responses: [
      "To verify an instrument certificate:<br><br><strong>Step 1</strong> &ndash; Go to the <a href='verify.html' class='text-gold font-bold underline'>Verification Page</a>.<br><strong>Step 2</strong> &ndash; Enter the <strong>Certificate Code</strong> (e.g. <code>CERT-2026-104921</code>) or scan the <strong>QR code</strong> sticker on the machine.<br><strong>Step 3</strong> &ndash; View the live compliance status (🟢 Valid, 🟡 Renewal Due, or 🔴 Expired)."
    ]
  },
  {
    patterns: [/\b(qr|qr code|scan|barcode)\b/i],
    responses: [
      "📷 <strong>QR Code Verification:</strong><br><br>Every verified instrument carries an official QR Code certificate sticker. You can:<ul><li>Scan it directly using your phone camera or our <a href='verify.html' class='text-gold font-bold underline'>Scan &amp; Verify Page</a></li><li>Check shop name, serial number, and exact expiry date in real-time</li></ul>"
    ]
  },
  {
    patterns: [/\b(complaint|complain|report|lodge|file|submit|raise)\b.*\b(how|process|steps|where)\b|\b(how to|how do i|where to|steps to)\b.*\b(complaint|complain|report|lodge|file)\b/i],
    responses: [
      "📋 <strong>Filing a Non-Compliance Grievance:</strong><br><br><strong>Step 1</strong> &ndash; Visit the <a href='complaint.html' class='text-gold font-bold underline'>File Complaint Page</a>.<br><strong>Step 2</strong> &ndash; Enter seller name, shop address, and violation type.<br><strong>Step 3</strong> &ndash; Attach photo evidence of inaccurate scale or forged stamp.<br><strong>Step 4</strong> &ndash; Submit to receive an official <strong>Complaint Tracking Reference</strong>.<br><br>⏳ Action is initiated by enforcement officers within <strong>7 working days</strong>."
    ]
  },
  {
    patterns: [/\b(track|status|check status|follow up|update)\b.*\b(complaint|application)\b|\b(complaint|application)\b.*\b(status|track|update)\b/i],
    responses: [
      "🔍 <strong>Track Complaint Status:</strong><br><br>Enter your reference code (e.g. <code>CMP-2026-849201</code>) on the <a href='complaint.html' class='text-gold font-bold underline'>Complaint Tracking Section</a>.<br><br><strong>Status codes:</strong><ul><li>⏳ <strong>Pending:</strong> Under queue review</li><li>👮 <strong>Action Taken:</strong> Officer assigned &amp; inspection conducted</li><li>✅ <strong>Resolved:</strong> Machine seized or compliance enforced</li></ul>"
    ]
  },
  {
    patterns: [/\b(documents?|docs?|required|need|papers?|submit)\b.*\b(certif|verif|stamping|apply|application|renewal)\b|\b(what documents?|what papers?)\b/i],
    responses: [
      "📄 <strong>Documents Required for Stamping:</strong><br><br><ul><li>✅ Trade License / GST Registration Certificate</li><li>✅ Previous verification certificate (for renewals)</li><li>✅ Machine purchase invoice &amp; serial number model specification</li><li>✅ Owner identity proof (Aadhaar / PAN)</li><li>✅ Clear photo of machine model plate</li></ul>"
    ]
  },
  {
    patterns: [/\b(renew|renewal|re-verify|reissue|expired certificate)\b/i],
    responses: [
      "🔄 <strong>Annual Re-verification:</strong><br><br>Verification certificates are valid for <strong>12 months</strong>. Business owners should:<ul><li>Submit renewal on the <a href='owner-dashboard.html' class='text-gold font-bold underline'>Seller Dashboard</a> within 30 days before expiry</li><li>Keep the instrument calibrated for physical inspector stamping</li></ul>⚠️ <em>Trading with an expired certificate attracts penalties under Section 24 of the Act.</em>"
    ]
  },
  {
    patterns: [/\b(fee|fees|charge|cost|payment|pay|price|amount|how much)\b/i],
    responses: [
      "💰 <strong>Government Verification Fees (Indicative):</strong><br><br><ul><li>⚖️ Counter &amp; Bench Scales: ₹100 &ndash; ₹300</li><li>🏭 Platform Scales &amp; Industrial Units: ₹500 &ndash; ₹1,500</li><li>🚚 Weighbridges (50 Ton+): ₹2,000 &ndash; ₹5,000</li><li>⛽ Fuel &amp; Liquid Dispensers: ₹500 &ndash; ₹1,000</li></ul>"
    ]
  },
  {
    patterns: [/\b(penalty|penalt|fine|punish|illegal|offence|offense|violation|law|act)\b/i],
    responses: [
      "⚠️ <strong>Statutory Penalties (Legal Metrology Act, 2009):</strong><br><br><ul><li><strong>Unverified Instrument:</strong> Fine up to ₹25,000 and up to 6 months imprisonment</li><li><strong>Tampering with Seal/Scale:</strong> Fine up to ₹50,000 and up to 1 year imprisonment</li><li><strong>Counterfeit Stamp / Fake Certificate:</strong> Fine up to ₹1,00,000 and up to 2 years imprisonment</li></ul>"
    ]
  },
  {
    patterns: [/\b(login|demo|credentials|password|email|officer login|seller login)\b/i],
    responses: [
      "🔑 <strong>Demo Access Credentials:</strong><br><br><strong>Legal Metrology Officer:</strong><br>&bull; Email: <code>officer@lmvs.gov</code><br>&bull; Password: <code>Officer@123</code><br><br><strong>Demo Business Owner:</strong><br>&bull; Email: <code>owner@example.com</code><br>&bull; Password: <code>Owner@123</code><br><br><a href='login.html' class='text-gold font-bold underline'>Go to Login Page &rarr;</a>"
    ]
  },
  {
    patterns: [/\b(thank|thanks|thank you|thx|tysm|bye|goodbye|see you|exit|done)\b/i],
    responses: [
      "😊 You're welcome! Feel free to ask anytime. Stay compliant and accurate! 🇮🇳",
      "👋 Glad to help! Thank you for using the Legal Metrology Verification System."
    ]
  },
  {
    patterns: [/\b(help|what can you do|options|menu|commands|features)\b/i],
    responses: [
      "🛍️ <strong>Here are top things you can ask me:</strong><br><br><ul><li>🔍 <em>How to verify a certificate?</em></li><li>📝 <em>How to report a dishonest seller?</em></li><li>📄 <em>What documents are needed for stamping?</em></li><li>🔄 <em>How does renewal work?</em></li><li>💰 <em>What are the verification fees?</em></li><li>🔑 <em>What are the demo login details?</em></li></ul>"
    ]
  }
];

const METROBOT_FALLBACKS = [
  "🤔 I'm not completely sure about that specific query. You can ask me about: certificate verification, filing complaints, required documents, or renewal rules.",
  "💡 Try clicking one of the quick question chips above, or ask about: verification, penalties, demo login, or fees.",
  "🔍 I didn't quite catch that. Try asking questions like 'How to verify certificate?' or 'What are the penalties?'"
];

function initChatbotWidget() {
  if (window.location.pathname.includes('chatbot.html') || document.getElementById('metrobotWidgetWrapper')) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'metrobotWidgetWrapper';
  wrapper.innerHTML = `
    <!-- Floating Trigger Button -->
    <button id="metrobotTriggerBtn" type="button" aria-label="Open MetroBot AI Helpdesk"
      class="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-navy via-navy-light to-slate-900 text-gold border-2 border-gold/70 px-4 py-3.5 rounded-full shadow-2xl hover:shadow-gold/30 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 group">
      <span class="text-2xl animate-bounce">🤖</span>
      <div class="text-left hidden sm:block">
        <span class="block text-xs font-black text-white group-hover:text-gold transition-colors leading-none">MetroBot AI</span>
        <span class="text-[10px] text-gold/80 font-medium">Ask Assistant</span>
      </div>
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
    </button>

    <!-- Slide-up Chat Window -->
    <div id="metrobotChatModal" class="hidden fixed bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[390px] h-[540px] max-h-[85vh] bg-[#0F2238] border border-gold/40 rounded-2xl shadow-2xl flex-col overflow-hidden backdrop-blur-lg">
      <!-- Header -->
      <div class="bg-gradient-to-r from-navy to-navy-light px-4 py-3 border-b border-gold/25 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-gold to-sky-500 flex items-center justify-center text-lg shadow">
            🤖
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-sm text-white tracking-wide">MetroBot AI</h3>
              <span class="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-semibold">Online</span>
            </div>
            <p class="text-[10px] text-gold/80">Legal Metrology Helpdesk</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <a href="chatbot.html" target="_blank" title="Open Full Screen in New Tab" class="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 text-xs transition-colors">
            ↗️
          </a>
          <button id="metrobotClearBtn" type="button" title="Clear Chat History" class="text-slate-400 hover:text-amber-300 p-1 rounded hover:bg-white/10 text-xs transition-colors">
            🧹
          </button>
          <button id="metrobotCloseBtn" type="button" title="Minimize Chat" class="text-slate-400 hover:text-red-300 p-1 rounded hover:bg-white/10 text-base font-bold transition-colors">
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Chips Bar -->
      <div class="bg-[#122842] px-3 py-2 border-b border-gold/15 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 text-[11px]">
        <button type="button" class="metro-chip bg-navy-light/80 hover:bg-gold/20 text-gold-light border border-gold/30 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors" data-query="How to verify a certificate?">🔍 Verify</button>
        <button type="button" class="metro-chip bg-navy-light/80 hover:bg-gold/20 text-gold-light border border-gold/30 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors" data-query="How to file a complaint?">📝 Complaint</button>
        <button type="button" class="metro-chip bg-navy-light/80 hover:bg-gold/20 text-gold-light border border-gold/30 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors" data-query="What are the verification fees?">💰 Fees</button>
        <button type="button" class="metro-chip bg-navy-light/80 hover:bg-gold/20 text-gold-light border border-gold/30 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors" data-query="What are the penalties?">⚠️ Penalties</button>
        <button type="button" class="metro-chip bg-navy-light/80 hover:bg-gold/20 text-gold-light border border-gold/30 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors" data-query="What is legal metrology?">⚖️ Info</button>
      </div>

      <!-- Messages Area -->
      <div id="metrobotMessages" class="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
        <div class="flex gap-2 items-end">
          <div class="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs flex-shrink-0">🤖</div>
          <div class="bg-[#183454] border border-white/10 rounded-2xl rounded-bl-sm p-3 text-slate-100 max-w-[85%] shadow-sm">
            👋 Namaste! I'm <strong>MetroBot</strong>, your Legal Metrology Assistant. How can I assist you with weighing scale compliance, certificate verification, or complaints today?
            <span class="block text-[9px] text-slate-400 mt-1 text-right">Just now</span>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div id="metrobotTyping" class="hidden px-4 pb-2">
        <div class="flex gap-2 items-center">
          <div class="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs">🤖</div>
          <div class="bg-[#183454] px-3 py-2 rounded-xl text-[11px] text-gold flex items-center gap-1">
            <span class="animate-bounce">●</span>
            <span class="animate-bounce [animation-delay:0.2s]">●</span>
            <span class="animate-bounce [animation-delay:0.4s]">●</span>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <form id="metrobotInputForm" class="p-3 bg-navy border-t border-gold/20 flex gap-2 items-center flex-shrink-0">
        <input type="text" id="metrobotInputText" placeholder="Ask about verification, complaints, rules..." autocomplete="off"
          class="flex-1 bg-[#162D4A] border border-gold/30 text-white placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold">
        <button type="submit" id="metrobotSendBtn" aria-label="Send message"
          class="bg-gold hover:bg-gold-light text-navy font-bold p-2.5 rounded-xl transition-transform active:scale-95 shadow">
          <svg class="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(wrapper);

  const triggerBtn = document.getElementById('metrobotTriggerBtn');
  const chatModal = document.getElementById('metrobotChatModal');
  const closeBtn = document.getElementById('metrobotCloseBtn');
  const clearBtn = document.getElementById('metrobotClearBtn');
  const form = document.getElementById('metrobotInputForm');
  const input = document.getElementById('metrobotInputText');
  const messages = document.getElementById('metrobotMessages');
  const typing = document.getElementById('metrobotTyping');

  function openChat() {
    chatModal.classList.remove('hidden');
    chatModal.classList.add('flex');
    triggerBtn.classList.add('hidden');
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }

  function closeChat() {
    chatModal.classList.add('hidden');
    chatModal.classList.remove('flex');
    triggerBtn.classList.remove('hidden');
  }

  triggerBtn.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  clearBtn.addEventListener('click', () => {
    messages.innerHTML = `
      <div class="flex gap-2 items-end">
        <div class="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs flex-shrink-0">🤖</div>
        <div class="bg-[#183454] border border-white/10 rounded-2xl rounded-bl-sm p-3 text-slate-100 max-w-[85%] shadow-sm">
          Chat cleared. How else can I assist you with Legal Metrology today?
          <span class="block text-[9px] text-slate-400 mt-1 text-right">Just now</span>
        </div>
      </div>
    `;
  });

  // Handle Quick Chips
  wrapper.querySelectorAll('.metro-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      input.value = q;
      form.dispatchEvent(new Event('submit'));
    });
  });

  // Handle Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    input.value = '';

    // Append User Message
    const userRow = document.createElement('div');
    userRow.className = 'flex gap-2 items-end justify-end';
    userRow.innerHTML = `
      <div class="bg-gradient-to-r from-sky-600 to-navy-light text-white rounded-2xl rounded-br-sm p-3 max-w-[85%] shadow-sm">
        ${escapeHtml(query)}
        <span class="block text-[9px] text-sky-200/80 mt-1 text-right">You</span>
      </div>
    `;
    messages.appendChild(userRow);
    messages.scrollTop = messages.scrollHeight;

    // Show Typing
    typing.classList.remove('hidden');
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.classList.add('hidden');

      // Match response from KB
      let reply = null;
      for (const item of METROBOT_KB) {
        for (const pat of item.patterns) {
          if (pat.test(query)) {
            reply = item.responses[Math.floor(Math.random() * item.responses.length)];
            break;
          }
        }
        if (reply) break;
      }

      if (!reply) {
        reply = METROBOT_FALLBACKS[Math.floor(Math.random() * METROBOT_FALLBACKS.length)];
      }

      const botRow = document.createElement('div');
      botRow.className = 'flex gap-2 items-end';
      botRow.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs flex-shrink-0">🤖</div>
        <div class="bg-[#183454] border border-white/10 rounded-2xl rounded-bl-sm p-3 text-slate-100 max-w-[85%] shadow-sm">
          ${reply}
          <span class="block text-[9px] text-slate-400 mt-1 text-right">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;
      messages.appendChild(botRow);
      messages.scrollTop = messages.scrollHeight;
    }, 400);
  });
}

// Auto-run chatbot widget initialization on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbotWidget);
  } else {
    initChatbotWidget();
  }
}

function initFooter() {
  const container = document.getElementById('footer-container');
  if (container) container.innerHTML = renderFooter();
}

function requireAuth(requiredRole) {
  const user = getCurrentUser();
  const token = getToken();
  if (!user || !token) {
    window.location.href = 'login.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = user.role === 'Owner' ? 'owner-dashboard.html' : 'officer-dashboard.html';
    return null;
  }
  return user;
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
}

function initModalClose(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => closeModal(id));
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(id);
  });
}

function printElement(elId) {
  const target = document.getElementById(elId);
  if (!target) return;
  target.classList.add('certificate-print-target');
  document.body.classList.add('printing');
  window.print();
  document.body.classList.remove('printing');
  target.classList.remove('certificate-print-target');
}
