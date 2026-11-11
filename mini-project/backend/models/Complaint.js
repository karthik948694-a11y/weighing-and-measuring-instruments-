const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  complainantName: {
    type: String,
    required: true,
    trim: true,
  },
  complainantPhone: {
    type: String,
    trim: true,
  },
  complainantEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  sellerName: {
    type: String,
    required: true,
    trim: true,
  },
  shopName: {
    type: String,
    trim: true,
  },
  shopAddress: {
    type: String,
    required: true,
    trim: true,
  },
  violationType: {
    type: String,
    trim: true,
    default: 'Expired Machine / No Renewal',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  photos: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Action Taken', 'Resolved', 'Dismissed'],
    default: 'Pending',
  },
  officerNotes: {
    type: String,
    default: '',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

complaintSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id ? obj._id.toString() : '';
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Complaint', complaintSchema);

