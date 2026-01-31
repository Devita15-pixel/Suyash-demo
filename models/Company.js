const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  CompanyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true
  },
  Address: {
    type: String,
    required: [true, 'Address is required']
  },
  GSTIN: {
    type: String,
    required: [true, 'GSTIN is required'],
    unique: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN']
  },
  PAN: {
    type: String,
    required: [true, 'PAN is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN']
  },
  State: {
    type: String,
    required: [true, 'State is required']
  },
  StateCode: {
    type: Number,
    required: [true, 'State code is required'],
    min: 1,
    max: 37
  },
  Phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  Email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  Logo: {
    type: String, // URL or file path
    default: ''
  },
  BankName: {
    type: String,
    required: [true, 'Bank name is required']
  },
  AccountNo: {
    type: String,
    required: [true, 'Account number is required']
  },
  IFSC: {
    type: String,
    required: [true, 'IFSC code is required'],
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
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

module.exports = mongoose.model('Company', companySchema);