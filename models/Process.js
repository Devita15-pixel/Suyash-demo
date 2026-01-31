const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  ProcessName: {
    type: String,
    required: [true, 'Process name is required'],
    trim: true,
    unique: true
  },
  RateType: {
    type: String,
    required: [true, 'Rate type is required'],
    enum: ['Per Nos', 'Per Kg', 'Per Hour', 'Fixed']
  },
  Rate: {
    type: Number,
    required: [true, 'Rate is required'],
    min: 0
  },
  VendorOrInhouse: {
    type: String,
    required: [true, 'Vendor/Inhouse is required'],
    enum: ['Vendor', 'Inhouse']
  },
  Description: {
    type: String,
    trim: true
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' }
});

module.exports = mongoose.model('Process', processSchema);