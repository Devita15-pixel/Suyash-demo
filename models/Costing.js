const mongoose = require('mongoose');

const costingSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: [true, 'Part number is required'],
    ref: 'Item'
  },
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
  ProcessCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
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
  FinalRate: {
    type: Number,
    min: 0
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

// Calculate all costs before saving
costingSchema.pre('save', function(next) {
  // Calculate RM Cost
  this.RMCost = this.RMWeight * this.RMRate;
  
  // Calculate Sub Cost
  const subCost = this.RMCost + this.ProcessCost + this.FinishingCost + this.PackingCost;
  
  // Calculate Overhead Cost
  this.OverheadCost = subCost * (this.OverheadPercentage / 100);
  
  // Calculate Margin Cost
  const costWithOverhead = subCost + this.OverheadCost;
  this.MarginCost = costWithOverhead * (this.MarginPercentage / 100);
  
  // Calculate Final Rate
  this.FinalRate = costWithOverhead + this.MarginCost;
  
  next();
});

module.exports = mongoose.model('Costing', costingSchema);