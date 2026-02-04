const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  VendorCode: {
    type: String,
    required: [true, 'Vendor code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  VendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  Address: {
    type: String,
    required: [true, 'Address is required']
  },
  City: {
    type: String,
    required: [true, 'City is required']
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
  Pincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  GSTIN: {
    type: String,
    default: '',
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, 'Please enter a valid GSTIN or leave empty']
  },
  PAN: {
    type: String,
    default: '',
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^$/, 'Please enter a valid PAN or leave empty']
  },
  ContactPerson: {
    type: String,
    required: [true, 'Contact person is required']
  },
  Phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  Email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  PaymentTerms: {
    type: String,
    default: '30 Days'
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  UpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
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

// Index for search optimization
vendorSchema.index({ VendorName: 'text', VendorCode: 'text', City: 'text', State: 'text' });
vendorSchema.index({ IsActive: 1 });
vendorSchema.index({ StateCode: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);