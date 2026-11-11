const express = require('express');
const { complaints } = require('../services/dbStore');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// 1. Citizen lodges complaint (public)
router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    const {
      complainantName,
      complainantPhone,
      complainantEmail,
      sellerName,
      shopName,
      shopAddress,
      violationType,
      description,
    } = req.body;

    if (!sellerName || !description) {
      return res.status(400).json({ message: 'Seller name and grievance description are required.' });
    }

    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const complaintNumber = `CMP-${year}-${randomHex}`;

    const photoPaths = req.files && req.files.length > 0
      ? req.files.map((f) => `uploads/${f.filename}`)
      : [];

    const newComplaint = await complaints.create({
      complaintNumber,
      complainantName: complainantName || 'Anonymous Citizen',
      complainantPhone: complainantPhone || '',
      complainantEmail: complainantEmail || '',
      sellerName,
      shopName: shopName || '',
      shopAddress: shopAddress || 'Location not specified',
      violationType: violationType || 'Expired Machine / No Renewal',
      description,
      photos: photoPaths,
      status: 'Pending',
    });

    return res.status(201).json({
      message: 'Grievance lodged successfully',
      complaint: newComplaint.toJSON(),
    });
  } catch (err) {
    console.error('Complaint submit error:', err);
    return res.status(500).json({ message: err.message || 'Failed to file complaint' });
  }
});

// 2. Get All Complaints
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const list = await complaints.find(filter);
    return res.json({ complaints: list.map((c) => (typeof c.toJSON === 'function' ? c.toJSON() : c)) });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list complaints' });
  }
});

// 3. Get Single Complaint
router.get('/:id', async (req, res) => {
  try {
    const cmp = await complaints.findById(req.params.id);
    if (!cmp) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    return res.json({ complaint: cmp.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to get complaint' });
  }
});

// 4. Update Complaint Status & Officer Notes (Officer only)
router.patch('/:id', auth, requireRole('Officer', 'Admin'), async (req, res) => {
  try {
    const cmp = await complaints.findById(req.params.id);
    if (!cmp) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.body.status) {
      cmp.status = req.body.status;
    }
    if (req.body.officerNotes !== undefined) {
      cmp.officerNotes = req.body.officerNotes;
    }

    await cmp.save();
    return res.json({
      message: 'Complaint updated successfully',
      complaint: cmp.toJSON(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update complaint' });
  }
});

module.exports = router;
