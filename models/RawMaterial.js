const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  MaterialName: {
    type: String,
    required: [true, 'Material name is required'],
    enum: ['Copper', 'Steel', 'Aluminium', 'Brass']
  },
  Grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true
  },
  RatePerKG: {
    type: Number,
    required: [true, 'Rate per KG is required'],
    min: 0
  },
  ScrapPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  TransportLossPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  EffectiveRate: {
    type: Number,
    min: 0
  },
  DateEffective: {
    type: Date,
    required: true,
    default: Date.now
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
// Calculate effective rate before saving
rawMaterialSchema.pre('save', function(next) {
  const totalPercentage = (this.ScrapPercentage + this.TransportLossPercentage) / 100;
  this.EffectiveRate = this.RatePerKG * (1 + totalPercentage);
  next();
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);