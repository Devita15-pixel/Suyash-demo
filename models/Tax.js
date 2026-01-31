const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  HSNCode: {
    type: String,
    required: [true, 'HSN code is required'],
    unique: true
  },
  GSTPercentage: {
    type: Number,
    required: [true, 'GST percentage is required'],
    min: 0,
    max: 100
  },
  CGSTPercentage: {
    type: Number,
    min: 0,
    max: 50
  },
  SGSTPercentage: {
    type: Number,
    min: 0,
    max: 50
  },
  IGSTPercentage: {
    type: Number,
    min: 0,
    max: 100
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

module.exports = mongoose.model('Tax', taxSchema);