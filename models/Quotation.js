const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: [true, 'Part number is required']
  },
  PartName: {
    type: String,
    required: [true, 'Part name is required']
  },
  Description: {
    type: String,
    default: ''
  },
  HSNCode: {
    type: String,
    required: [true, 'HSN code is required']
  },
  Unit: {
    type: String,
    enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'],
    default: 'Nos'
  },
  Quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  FinalRate: {
    type: Number,
    required: [true, 'Final rate is required'],
    min: 0
  },
  Amount: {
    type: Number,
    min: 0
  }
});

// Calculate amount before saving
quotationItemSchema.pre('save', function(next) {
  this.Amount = this.Quantity * this.FinalRate;
  this.Amount = Math.round(this.Amount * 100) / 100; // Round to 2 decimal places
  next();
});

const quotationSchema = new mongoose.Schema({
  // Auto-generated fields
  QuotationNo: {
    type: String,
    unique: true,
    index: true
  },
  QuotationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  ValidTill: {
    type: Date,
    required: true
  },
  
  // Company Info (Auto from Company Master)
  CompanyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  CompanyName: {
    type: String,
    required: true
  },
  CompanyGSTIN: {
    type: String,
    required: true
  },
  CompanyState: {
    type: String,
    required: true
  },
  CompanyStateCode: {
    type: Number,
    required: true
  },
  
  // Vendor Info (Either existing vendor or new vendor details)
  VendorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
    // Can be null if new vendor is added during quotation
  },
  VendorName: {
    type: String,
    required: true
  },
  VendorGSTIN: {
    type: String,
    default: ''
  },
  VendorState: {
    type: String,
    required: true
  },
  VendorStateCode: {
    type: Number,
    required: true
  },
  VendorAddress: {
    type: String,
    default: ''
  },
  VendorCity: {
    type: String,
    default: ''
  },
  VendorPincode: {
    type: String,
    default: ''
  },
  VendorContactPerson: {
    type: String,
    default: ''
  },
  VendorPhone: {
    type: String,
    default: ''
  },
  VendorEmail: {
    type: String,
    default: ''
  },
  VendorPAN: {
    type: String,
    default: ''
  },
  
  // Vendor Type: 'Existing' or 'New'
  VendorType: {
    type: String,
    enum: ['Existing', 'New'],
    default: 'Existing'
  },
  
  // GST Logic (Auto-calculated)
  GSTType: {
    type: String,
    enum: ['CGST/SGST', 'IGST'],
    default: 'CGST/SGST'
  },
  
  // Items Section
  Items: [quotationItemSchema],
  
  // Tax & Amount Summary (Auto-calculated)
  SubTotal: {
    type: Number,
    min: 0,
    default: 0
  },
  GSTPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  GSTAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  GrandTotal: {
    type: Number,
    min: 0,
    default: 0
  },
  AmountInWords: {
    type: String,
    default: ''
  },
  
  // Terms & Conditions (Auto from T&C Master)
  TermsConditions: [{
    Title: String,
    Description: String,
    Sequence: Number
  }],
  
  // Remarks Section
  InternalRemarks: {
    type: String,
    default: ''
  },
  CustomerRemarks: {
    type: String,
    default: ''
  },
  
  // Status & Tracking
  Status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Draft'
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  
  // Audit Trail
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  UpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  SentAt: {
    type: Date
  },
  ApprovedAt: {
    type: Date
  },
  PDFPath: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate totals before saving
quotationSchema.pre('save', function(next) {
  // Auto-generate Quotation Number
  if (!this.QuotationNo) {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.QuotationNo = `QT-${year}${month}-${random}`;
  }
  
  // Calculate SubTotal
  this.SubTotal = this.Items.reduce((total, item) => total + (item.Amount || 0), 0);
  this.SubTotal = Math.round(this.SubTotal * 100) / 100;
  
  // Calculate GST Amount
  this.GSTAmount = (this.SubTotal * this.GSTPercentage) / 100;
  this.GSTAmount = Math.round(this.GSTAmount * 100) / 100;
  
  // Calculate Grand Total
  this.GrandTotal = this.SubTotal + this.GSTAmount;
  this.GrandTotal = Math.round(this.GrandTotal * 100) / 100;
  
  // Auto-determine GST Type based on state
  if (this.VendorStateCode !== this.CompanyStateCode) {
    this.GSTType = 'IGST';
  } else {
    this.GSTType = 'CGST/SGST';
  }
  
  next();
});

// Auto set ValidTill if not provided
quotationSchema.pre('save', function(next) {
  if (!this.ValidTill) {
    const defaultValidityDays = 30; // Configurable
    const validTill = new Date(this.QuotationDate);
    validTill.setDate(validTill.getDate() + defaultValidityDays);
    this.ValidTill = validTill;
  }
  next();
});

// Helper function to convert number to words (Indian Number System)
quotationSchema.methods.getAmountInWords = function() {
  const amount = this.GrandTotal;
  
  // Separate rupees and paise
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  // Arrays for number words
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
               'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
               'Seventeen', 'Eighteen', 'Nineteen'];
  
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const thousands = ['', 'Thousand', 'Lakh', 'Crore'];
  
  // Function to convert a number less than 1000 to words
  const convertHundreds = (num) => {
    let result = '';
    
    // Handle hundreds
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    // Handle tens and ones
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result.trim();
  };
  
  // Function to convert rupees to words using Indian numbering system
  const convertRupeesToWords = (num) => {
    if (num === 0) return 'Zero';
    
    let result = '';
    let groupIndex = 0;
    
    while (num > 0) {
      // Get the last 3 digits for thousands, then 2 digits for lakhs and crores
      let group;
      if (groupIndex === 0) {
        // For thousands group, take 3 digits
        group = num % 1000;
        num = Math.floor(num / 1000);
      } else {
        // For lakhs and crores groups, take 2 digits
        group = num % 100;
        num = Math.floor(num / 100);
      }
      
      if (group > 0) {
        let groupWords = convertHundreds(group);
        if (thousands[groupIndex]) {
          groupWords += ' ' + thousands[groupIndex];
        }
        result = groupWords + ' ' + result;
      }
      
      groupIndex++;
    }
    
    return result.trim();
  };
  
  // Convert rupees to words
  let rupeesWords = convertRupeesToWords(rupees);
  
  // Convert paise to words
  let paiseWords = '';
  if (paise > 0) {
    paiseWords = convertRupeesToWords(paise);
  }
  
  // Construct final string
  let result = '';
  
  if (rupeesWords) {
    result += rupeesWords + ' Rupee' + (rupees === 1 ? '' : 's');
  } else {
    result += 'Zero Rupees';
  }
  
  if (paiseWords && paiseWords !== 'Zero') {
    result += ' and ' + paiseWords + ' Paise';
  }
  
  result += ' Only';
  
  // Capitalize first letter
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  return result.replace(/\s+/g, ' ').trim();
};

// Update AmountInWords before saving
quotationSchema.pre('save', function(next) {
  if (this.GrandTotal > 0) {
    this.AmountInWords = this.getAmountInWords();
  } else {
    this.AmountInWords = 'Zero Rupees Only';
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);