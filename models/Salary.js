const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  EmployeeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  BasicPay: {
    type: Number,
    required: true,
    min: 0
  },
  HRA: {
    type: Number,
    default: 0,
    min: 0
  },
  DA: {
    type: Number,
    default: 0,
    min: 0
  },
  TA: {
    type: Number,
    default: 0,
    min: 0
  },
  MedicalAllowance: {
    type: Number,
    default: 0,
    min: 0
  },
  OtherAllowances: {
    type: Number,
    default: 0,
    min: 0
  },
  PF: {
    type: Number,
    default: 0,
    min: 0
  },
  TDS: {
    type: Number,
    default: 0,
    min: 0
  },
  ProfessionalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  NetPay: {
    type: Number,
    min: 0
  },
  EffectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  EffectiveTo: {
    type: Date
  },
  Remarks: {
    type: String,
    trim: true,
    maxlength: 500
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

// Pre-save middleware to calculate NetPay and update UpdatedAt
salarySchema.pre('save', function(next) {
  this.UpdatedAt = Date.now();
  
  // Calculate NetPay
  const totalAllowances = this.BasicPay + this.HRA + this.DA + this.TA + 
                         this.MedicalAllowance + this.OtherAllowances;
  const totalDeductions = this.PF + this.TDS + this.ProfessionalTax;
  this.NetPay = totalAllowances - totalDeductions;
  
  next();
});

module.exports = mongoose.model('Salary', salarySchema);