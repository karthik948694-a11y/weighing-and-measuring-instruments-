const express = require('express');
const qrcode = require('qrcode');
const { applications } = require('../services/dbStore');
const { auth, requireRole } = require('../middleware/auth');
const { upload, uploadAppMedia } = require('../middleware/upload');

const router = express.Router();

// 1. Submit Application (Machine Holder) with Photo & Video Proof
router.post('/', auth, (req, res, next) => {
  uploadAppMedia(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Uploaded file exceeds the 16 MB size limit.' });
      }
      if (err.message && err.message.includes('permitted')) {
        return res.status(400).json({ message: 'Invalid file type. Only images and video files (MP4, WEBM, MOV) are allowed.' });
      }
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const {
      instrumentName,
      category,
      serialNumber,
      capacity,
      shopName,
      shopAddress,
      phone,
      aadhaarNo,
    } = req.body;

    if (!instrumentName || !category) {
      return res.status(400).json({ message: 'Instrument Name and Category are required' });
    }

    let photoPath = '';
    let videoPath = '';

    if (req.files) {
      if (req.files['photo'] && req.files['photo'].length > 0) {
        photoPath = `uploads/${req.files['photo'][0].filename}`;
      }
      if (req.files['video'] && req.files['video'].length > 0) {
        videoPath = `uploads/${req.files['video'][0].filename}`;
      }
    } else if (req.file) {
      photoPath = `uploads/${req.file.filename}`;
    }

    const newApp = await applications.create({
      userId: req.user._id || req.user.id,
      ownerName: req.user.name,
      shopName: shopName || req.user.shopName || '',
      shopAddress: shopAddress || req.user.shopAddress || '',
      phone: phone || req.user.phone || '',
      aadhaarNo: aadhaarNo || req.user.aadhaarNo || '',
      instrumentName,
      category,
      serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      capacity: capacity || '150 kg',
      photo: photoPath,
      video: videoPath,
      status: 'Pending',
    });

    return res.status(201).json({
      message: 'Weighing instrument application submitted for verification',
      application: newApp.toJSON(),
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Uploaded file exceeds the 16 MB size limit.' });
    }
    if (err.message && err.message.includes('permitted')) {
      return res.status(400).json({ message: 'Invalid file type. Only images and video files (MP4, WEBM, MOV) are allowed.' });
    }
    console.error('Application submission error:', err);
    return res.status(500).json({ message: err.message || 'Submission failed' });
  }
});

// 2. Get Owner's Applications
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const apps = await applications.find({
      $or: [
        { userId: userId },
        { ownerName: req.user.name },
      ],
    });

    return res.json({ applications: apps.map((a) => (typeof a.toJSON === 'function' ? a.toJSON() : a)) });
  } catch (err) {
    console.error('Fetch mine error:', err);
    return res.status(500).json({ message: err.message || 'Could not retrieve instruments' });
  }
});

// 3. Stats for Dashboard
router.get('/stats', auth, async (_req, res) => {
  try {
    const all = await applications.find();
    const verified = all.filter((a) => a.status === 'Verified');
    const pending = all.filter((a) => a.status === 'Pending');

    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    verified.forEach((a) => {
      const alert = typeof a.calculateAlert === 'function' ? a.calculateAlert() : (a.alert || {});
      if (alert.level === 'green') greenCount++;
      else if (alert.level === 'yellow') yellowCount++;
      else if (alert.level === 'red') redCount++;
    });

    return res.json({
      total: all.length,
      verified: verified.length,
      pending: pending.length,
      expired: redCount,
      dueSoon: yellowCount,
      greenCount,
      yellowCount,
      redCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch application stats' });
  }
});

// 4. Alerts / Verified instruments
router.get('/alerts', auth, requireRole('Officer', 'Admin'), async (_req, res) => {
  try {
    const verified = await applications.find({ status: 'Verified' });
    return res.json({ applications: verified.map((a) => (typeof a.toJSON === 'function' ? a.toJSON() : a)) });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch alerts' });
  }
});

// 5. Inspections list
router.get('/inspections', auth, requireRole('Officer', 'Admin'), async (_req, res) => {
  try {
    const all = await applications.find();
    const inspections = all.filter((a) => a.inspectionStatus || a.status === 'Pending');
    return res.json({ applications: inspections.map((a) => (typeof a.toJSON === 'function' ? a.toJSON() : a)) });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch inspections' });
  }
});

// 6. Get All Applications (Officer only)
router.get('/', auth, requireRole('Officer', 'Admin'), async (_req, res) => {
  try {
    const apps = await applications.find();
    return res.json({ applications: apps.map((a) => (typeof a.toJSON === 'function' ? a.toJSON() : a)) });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list applications' });
  }
});

// 7. Get Pending Applications (Officer only)
router.get('/pending', auth, requireRole('Officer', 'Admin'), async (_req, res) => {
  try {
    const pending = await applications.find({ status: 'Pending' });
    return res.json({ applications: pending.map((a) => (typeof a.toJSON === 'function' ? a.toJSON() : a)) });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to retrieve pending list' });
  }
});

// 8. Get Application Details
router.get('/:id', async (req, res) => {
  try {
    const app = await applications.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }
    return res.json({ application: app.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load application' });
  }
});

// 9. Officer Approval: generates certificate ID, sets 1-year expiry, generates QR code
router.post('/:id/approve', auth, requireRole('Officer', 'Admin'), async (req, res) => {
  try {
    const app = await applications.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { verificationResult = 'Pass', observations = 'Calibrated and certified compliant.' } = req.body;

    const certYear = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const certificateId = `LM-${certYear}-${randomHex}`;

    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    const qrPayload = JSON.stringify({
      certId: certificateId,
      owner: app.ownerName,
      shop: app.shopName,
      instrument: app.instrumentName,
      verified: now.toISOString().slice(0, 10),
      expires: expiry.toISOString().slice(0, 10),
      officer: req.user.name,
      status: 'VERIFIED',
    });

    const qrCodeDataUrl = await qrcode.toDataURL(qrPayload, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });

    app.status = 'Verified';
    app.certificateId = certificateId;
    app.verificationDate = now;
    app.expiryDate = expiry;
    app.verificationResult = verificationResult;
    app.observations = observations;
    app.qrCode = qrCodeDataUrl;

    await app.save();

    return res.json({
      message: 'Instrument successfully verified and certificate generated',
      application: app.toJSON(),
    });
  } catch (err) {
    console.error('Approve error:', err);
    return res.status(500).json({ message: err.message || 'Approval failed' });
  }
});

// 10. Officer Physical Inspection
router.post('/:id/inspect', auth, requireRole('Officer', 'Admin'), async (req, res) => {
  try {
    const app = await applications.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.inspectionStatus = req.body.inspectionStatus || 'Scheduled';
    app.inspectionDate = req.body.inspectionDate || new Date();
    app.observations = req.body.observations || app.observations;
    await app.save();

    return res.json({
      message: 'Physical inspection details updated',
      application: app.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Inspection update failed' });
  }
});

// 11. Instrument Renewal
router.post('/:id/renew', auth, async (req, res) => {
  try {
    const app = await applications.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = 'Pending';
    app.certificateId = null;
    app.qrCode = null;
    app.verificationDate = null;
    app.expiryDate = null;
    app.observations = 'Renewal requested by machine holder.';
    await app.save();

    return res.json({
      message: 'Renewal application submitted for verification',
      application: app.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Renewal failed' });
  }
});

// 12. Officer Rejection
router.post('/:id/reject', auth, requireRole('Officer', 'Admin'), async (req, res) => {
  try {
    const app = await applications.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = 'Rejected';
    app.observations = req.body.observations || 'Instrument does not meet calibration standards.';
    await app.save();

    return res.json({
      message: 'Application marked as rejected',
      application: app.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Rejection failed' });
  }
});

module.exports = router;
