const mongoose = require('mongoose');

const termsConditionSchema = new mongoose.Schema({
  TermType: {
    type: String,
    required: [true, 'Term type is required'],
    enum: ['Payment', 'Delivery', 'Validity', 'Transportation', 'Warranty', 'General']
  },
  Title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  Description: {
    type: String,
    required: [true, 'Description is required']
  },
  Sequence: {
    type: Number,
    required: true,
    min: 1
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

module.exports = mongoose.model('TermsCondition', termsConditionSchema);