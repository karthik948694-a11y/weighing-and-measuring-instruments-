const express = require('express');
const { applications } = require('../services/dbStore');

const router = express.Router();

router.get('/:certId', async (req, res) => {
  try {
    const certCode = req.params.certId.trim();

    const app = await applications.findOne({
      $or: [
        { certificateId: certCode },
        { _id: certCode },
      ],
    });

    if (!app) {
      return res.status(404).json({
        found: false,
        valid: false,
        message: 'No official verification certificate found for this identifier.',
      });
    }

    const alert = typeof app.calculateAlert === 'function'
      ? app.calculateAlert()
      : (app.alert || { daysLeft: 300, level: 'green', label: 'VALID', color: '#10b981' });

    const isValid = app.status === 'Verified' && alert.level !== 'red';

    return res.json({
      found: true,
      valid: isValid,
      certificate: {
        id: app._id ? app._id.toString() : app.id,
        certificateId: app.certificateId,
        ownerName: app.ownerName,
        shopName: app.shopName,
        shopAddress: app.shopAddress,
        instrumentName: app.instrumentName,
        category: app.category,
        capacity: app.capacity,
        serialNumber: app.serialNumber,
        verificationDate: app.verificationDate,
        expiryDate: app.expiryDate,
        verificationResult: app.verificationResult,
        observations: app.observations,
        photo: app.photo,
        video: app.video,
        qrCode: app.qrCode,
        status: app.status,
      },
      alert,
    });
  } catch (err) {
    console.error('Verify lookup error:', err);
    return res.status(500).json({ message: err.message || 'Verification lookup failed' });
  }
});

module.exports = router;
