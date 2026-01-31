const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: true,
    ref: 'Item'
  },
  PartName: {
    type: String,
    required: true
  },
  Description: {
    type: String
  },
  HSNCode: {
    type: String,
    required: true
  },
  Unit: {
    type: String,
    required: true,
    enum: ['Nos', 'Kg', 'Meter', 'Set']
  },
  Quantity: {
    type: Number,
    required: true,
    min: 1
  },
  FinalRate: {
    type: Number,
    required: true,
    min: 0
  },
  Amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const quotationSchema = new mongoose.Schema({
  QuotationNo: {
    type: String,
    required: [true, 'Quotation number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  QuotationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  ValidTill: {
    type: Date,
    required: true
  },
  CompanyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  CustomerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  CustomerGSTIN: {
    type: String,
    required: true
  },
  CustomerState: {
    type: String,
    required: true
  },
  CustomerStateCode: {
    type: Number,
    required: true
  },
  GSTType: {
    type: String,
    required: true,
    enum: ['IGST', 'CGST+SGST']
  },
  Items: [quotationItemSchema],
  SubTotal: {
    type: Number,
    required: true,
    min: 0
  },
  GSTPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  GSTAmount: {
    type: Number,
    required: true,
    min: 0
  },
  GrandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  AmountInWords: {
    type: String,
    required: true
  },
  TermsConditions: [{
    TermType: String,
    Title: String,
    Description: String
  }],
  InternalRemarks: {
    type: String,
    trim: true
  },
  CustomerRemarks: {
    type: String,
    trim: true
  },
  Status: {
    type: String,
    required: true,
    enum: ['Draft', 'Approved', 'Sent', 'Converted', 'Expired'],
    default: 'Draft'
  },
  PDFUrl: {
    type: String
  },
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ApprovedAt: {
    type: Date
  },
  SentAt: {
    type: Date
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

// Calculate amounts before saving
quotationSchema.pre('save', function(next) {
  // Calculate SubTotal from items
  if (this.Items && this.Items.length > 0) {
    this.SubTotal = this.Items.reduce((sum, item) => sum + item.Amount, 0);
  }
  
  // Calculate GST Amount
  this.GSTAmount = this.SubTotal * (this.GSTPercentage / 100);
  
  // Calculate Grand Total
  this.GrandTotal = this.SubTotal + this.GSTAmount;
  
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);