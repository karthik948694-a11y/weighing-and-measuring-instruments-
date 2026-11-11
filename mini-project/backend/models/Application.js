const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  shopName: {
    type: String,
    required: true,
    trim: true,
  },
  shopAddress: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  aadhaarNo: {
    type: String,
    trim: true,
  },
  instrumentName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  serialNumber: {
    type: String,
    trim: true,
  },
  capacity: {
    type: String,
    trim: true,
  },
  photo: {
    type: String,
    default: '',
  },
  video: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Expired', 'Rejected'],
    default: 'Pending',
  },
  certificateId: {
    type: String,
    trim: true,
    index: true,
  },
  verificationDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  verificationResult: {
    type: String,
    trim: true,
  },
  observations: {
    type: String,
    trim: true,
  },
  qrCode: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper to calculate alert status based on expiryDate
applicationSchema.methods.calculateAlert = function () {
  if (!this.expiryDate || this.status !== 'Verified') {
    return {
      daysLeft: 0,
      level: this.status === 'Pending' ? 'yellow' : 'red',
      label: this.status,
      color: this.status === 'Pending' ? '#f59e0b' : '#ef4444',
    };
  }

  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      level: 'red',
      label: 'EXPIRED',
      color: '#ef4444',
    };
  } else if (daysLeft <= 30) {
    return {
      daysLeft,
      level: 'yellow',
      label: 'RENEWAL DUE',
      color: '#f59e0b',
    };
  } else {
    return {
      daysLeft,
      level: 'green',
      label: 'VALID',
      color: '#10b981',
    };
  }
};

applicationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id ? obj._id.toString() : '';
  obj.alert = this.calculateAlert();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Application', applicationSchema);

