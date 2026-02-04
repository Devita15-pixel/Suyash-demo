const mongoose = require('mongoose');

const costingSchema = new mongoose.Schema({
  ItemID: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Item reference is required'],
    ref: 'Item'
  },
  PartNo: {
    type: String,
    required: [true, 'Part number is required'],
    ref: 'Item'
  },
  // Raw Material Section
  RMWeight: {
    type: Number,
    required: [true, 'Raw material weight is required'],
    min: 0
  },
  RMRate: {
    type: Number,
    required: [true, 'Raw material rate is required'],
    min: 0
  },
  RMCost: {
    type: Number,
    min: 0
  },
  
  // Process Section
  ProcessCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Finishing & Packing
  FinishingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  PackingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Overhead
  OverheadPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  OverheadCost: {
    type: Number,
    min: 0
  },
  
  // Margin
  MarginPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 15
  },
  MarginCost: {
    type: Number,
    min: 0
  },
  
  // Final Calculations
  SubCost: {
    type: Number,
    min: 0
  },
  FinalRate: {
    type: Number,
    min: 0
  },
  
  // Additional Fields
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
  timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate all costs before saving
costingSchema.pre('save', function(next) {
  // 1. Calculate RM Cost = Weight × Effective RM Rate
  this.RMCost = this.RMWeight * this.RMRate;
  
  // 2. Calculate Sub Cost = RM Cost + Process Cost + Finishing + Packing
  this.SubCost = this.RMCost + this.ProcessCost + this.FinishingCost + this.PackingCost;
  
  // 3. Calculate Overhead Cost = Sub Cost × Overhead %
  this.OverheadCost = this.SubCost * (this.OverheadPercentage / 100);
  
  // 4. Calculate Margin Cost = Sub Cost × Margin %
  this.MarginCost = this.SubCost * (this.MarginPercentage / 100);
  
  // 5. Calculate Final Rate = Sub Cost + Overhead Cost + Margin Cost
  this.FinalRate = this.SubCost + this.OverheadCost + this.MarginCost;
  
  // Round all monetary values to 2 decimal places
  this.RMCost = Math.round(this.RMCost * 100) / 100;
  this.SubCost = Math.round(this.SubCost * 100) / 100;
  this.OverheadCost = Math.round(this.OverheadCost * 100) / 100;
  this.MarginCost = Math.round(this.MarginCost * 100) / 100;
  this.FinalRate = Math.round(this.FinalRate * 100) / 100;
  
  next();
});

module.exports = mongoose.model('Costing', costingSchema);