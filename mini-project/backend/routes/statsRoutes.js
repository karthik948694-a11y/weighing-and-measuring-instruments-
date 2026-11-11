const express = require('express');
const { applications, complaints } = require('../services/dbStore');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const pendingCount = await applications.countDocuments({ status: 'Pending' });
    const verifiedCount = await applications.countDocuments({ status: 'Verified' });
    const complaintsCount = await complaints.countDocuments();

    const now = new Date();
    const expiredCount = await applications.countDocuments({
      status: 'Verified',
      expiryDate: { $lt: now },
    });

    return res.json({
      pending: pendingCount,
      verified: verifiedCount,
      expired: expiredCount,
      complaints: complaintsCount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to calculate stats' });
  }
});

module.exports = router;
