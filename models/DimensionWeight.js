const mongoose = require('mongoose');

const dimensionWeightSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: [true, 'Part number is required'],
    ref: 'Item',
    uppercase: true, // Always store in uppercase
    trim: true
  },
  Thickness: {
    type: Number,
    required: [true, 'Thickness is required'],
    min: [0.1, 'Thickness must be at least 0.1 mm'],
    max: [1000, 'Thickness cannot exceed 1000 mm']
  },
  Width: {
    type: Number,
    required: [true, 'Width is required'],
    min: [0.1, 'Width must be at least 0.1 mm'],
    max: [5000, 'Width cannot exceed 5000 mm']
  },
  Length: {
    type: Number,
    required: [true, 'Length is required'],
    min: [0.1, 'Length must be at least 0.1 mm'],
    max: [10000, 'Length cannot exceed 10000 mm']
  },
  Density: {
    type: Number,
    required: [true, 'Density is required'],
    min: [0.1, 'Density must be at least 0.1 g/cm³'],
    max: [25, 'Density cannot exceed 25 g/cm³'],
    default: 8.96 // Copper density
  },
  WeightInKG: {
    type: Number,
    min: 0,
    set: function(val) {
      return Math.round(val * 1000) / 1000; // Round to 3 decimal places
    }
  },
  VolumeMM3: {
    type: Number,
    min: 0,
    set: function(val) {
      return Math.round(val * 1000) / 1000; // Round to 3 decimal places
    }
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

// Virtual for formatted weight
dimensionWeightSchema.virtual('WeightFormatted').get(function() {
  return this.WeightInKG ? `${this.WeightInKG.toFixed(3)} Kg` : 'N/A';
});

// Virtual for formatted dimensions
dimensionWeightSchema.virtual('DimensionsFormatted').get(function() {
  return `T: ${this.Thickness}mm × W: ${this.Width}mm × L: ${this.Length}mm`;
});

// Calculate weight before saving
dimensionWeightSchema.pre('save', function(next) {
  // Calculate Volume (mm³) = T × W × L
  this.VolumeMM3 = this.Thickness * this.Width * this.Length;
  
  // Calculate Weight (Kg) = (Volume × Density) / 1,000,000
  this.WeightInKG = (this.VolumeMM3 * this.Density) / 1000000;
  
  next();
});

// Update timestamp and user info before update
dimensionWeightSchema.pre('findOneAndUpdate', function(next) {
  this.set({ UpdatedAt: Date.now() });
  next();
});

// Index for faster queries
dimensionWeightSchema.index({ PartNo: 1 });
dimensionWeightSchema.index({ CreatedAt: -1 });
dimensionWeightSchema.index({ WeightInKG: 1 });

module.exports = mongoose.model('DimensionWeight', dimensionWeightSchema);