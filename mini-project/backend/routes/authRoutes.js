const express = require('express');
const jwt = require('jsonwebtoken');
const { users, isAtlasConnected } = require('../services/dbStore');
const { auth } = require('../middleware/auth');

const router = express.Router();

function createToken(user) {
  const userId = user._id ? user._id.toString() : (user.id || '');
  return jwt.sign(
    { id: userId, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'lmvs-dev-secret-change-in-production-2026',
    { expiresIn: '7d' }
  );
}

// 1. Machine Holder Registration (or general registration)
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      aadhaarNo,
      officerId,
      shopName,
      shopAddress,
      password,
      role = 'Owner',
    } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'Name and Password are required' });
    }

    // If an officer registration is submitted here
    if (role === 'Officer' || officerId) {
      const offId = (officerId || '').trim().toLowerCase();
      if (!offId.startsWith('113iom')) {
        return res.status(400).json({
          message: "Unauthorized Officer ID: Officer ID must start with authorized code '113iom' (e.g. 113iom20, 113iom21)",
        });
      }

      const existingOfficer = await users.findOne({ officerId: offId });
      if (existingOfficer) {
        return res.status(400).json({
          message: `Officer ID ${offId} is already registered. Please sign in with your credentials.`,
        });
      }

      const officer = await users.create({
        name,
        officerId: offId,
        email: email ? email.toLowerCase() : `${offId}@lmvs.gov`,
        phone: phone || '011-2338-0000',
        shopName: shopName || 'Legal Metrology Enforcement Division',
        shopAddress: shopAddress || 'District Administrative Complex, Room 104',
        password,
        role: 'Officer',
      });

      const token = createToken(officer);
      return res.status(201).json({ token, user: officer.toJSON() });
    }

    // Machine Holder (Owner) Registration
    const cleanAadhaar = (aadhaarNo || '').replace(/\D/g, '');
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const existingUser = await users.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(cleanAadhaar && cleanAadhaar.length >= 10 ? [{ aadhaarNo: aadhaarNo.trim() }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'A machine holder account with this Aadhaar Number or Email is already registered.',
      });
    }

    const newUser = await users.create({
      name,
      email: cleanEmail || `${cleanPhone || Date.now()}@lmvs.shop`,
      phone: phone || '',
      aadhaarNo: aadhaarNo || '',
      shopName: shopName || `${name}'s Commercial Mart`,
      shopAddress: shopAddress || '',
      password,
      role: 'Owner',
    });

    const token = createToken(newUser);
    return res.status(201).json({ token, user: newUser.toJSON() });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
});

// 2. Dedicated Officer Registration
router.post('/officer-register', async (req, res) => {
  try {
    const { name, idno, officerId, password, email, phone, shopAddress } = req.body;
    const rawId = (idno || officerId || '').trim();

    if (!rawId) {
      return res.status(400).json({ message: 'Officer ID Number is mandatory.' });
    }

    const idLower = rawId.toLowerCase();
    // Rule: Starts with 113iom (e.g. 113iom20, 113iom21, etc.)
    if (!idLower.startsWith('113iom')) {
      return res.status(400).json({
        message: "Invalid Officer ID: Officer ID must start with authorized prefix '113iom' (e.g. 113iom20, 113iom21).",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Officer Name is required.' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ message: 'Please provide a valid password/PIN.' });
    }

    // Check if already registered
    const existing = await users.findOne({ officerId: idLower });
    if (existing) {
      return res.status(400).json({
        message: `Officer ID "${rawId}" is already registered. Please proceed to login.`,
      });
    }

    const officer = await users.create({
      name: name.trim(),
      officerId: idLower,
      email: email ? email.trim().toLowerCase() : `${idLower}@lmvs.gov`,
      phone: phone || '011-2338-0000',
      shopName: 'Legal Metrology Enforcement Division',
      shopAddress: shopAddress || 'District Administrative Complex, Room 104',
      password,
      role: 'Officer',
    });

    const token = createToken(officer);
    return res.status(201).json({
      message: `Officer ${name} (${rawId}) registered successfully!`,
      token,
      user: officer.toJSON(),
    });
  } catch (err) {
    console.error('Officer register error:', err);
    return res.status(500).json({ message: err.message || 'Officer registration failed' });
  }
});

// 3. Universal Login (Machine Holder & Officer)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, officerId, password } = req.body;
    const rawId = (identifier || email || officerId || '').trim();
    const enteredPass = password || '';

    if (!rawId || !enteredPass) {
      return res.status(400).json({ message: 'Login identifier and password are required' });
    }

    const idLower = rawId.toLowerCase();
    const cleanDigits = rawId.replace(/\D/g, '');

    const searchConditions = [
      { email: idLower },
      { officerId: idLower },
    ];

    if (cleanDigits.length >= 10) {
      searchConditions.push({ phone: cleanDigits });
      searchConditions.push({ aadhaarNo: cleanDigits });
    }

    if (idLower.startsWith('113iom')) {
      searchConditions.unshift({ officerId: idLower });
    }

    const user = await users.findOne({ $or: searchConditions });

    if (!user) {
      return res.status(401).json({
        message: 'Account not found. Please verify your Aadhaar / Mobile / Officer ID / Email.',
      });
    }

    const isMatch = await user.comparePassword(enteredPass);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// 4. Current User Session
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

module.exports = router;
