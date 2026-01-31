const mongoose = require('mongoose');

const dimensionWeightSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: [true, 'Part number is required'],
    ref: 'Item'
  },
  Thickness: {
    type: Number,
    required: [true, 'Thickness is required'],
    min: 0.1
  },
  Width: {
    type: Number,
    required: [true, 'Width is required'],
    min: 0.1
  },
  Length: {
    type: Number,
    required: [true, 'Length is required'],
    min: 0.1
  },
  Density: {
    type: Number,
    required: [true, 'Density is required'],
    min: 0.1,
    default: 8.96 // Copper density
  },
  WeightInKG: {
    type: Number,
    min: 0
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

// Calculate weight before saving
dimensionWeightSchema.pre('save', function(next) {
  const volume = this.Thickness * this.Width * this.Length; // mm³
  this.WeightInKG = (volume * this.Density) / 1000000; // Convert to kg
  next();
});

module.exports = mongoose.model('DimensionWeight', dimensionWeightSchema);