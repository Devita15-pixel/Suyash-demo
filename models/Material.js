const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  MaterialCode: {
    type: String,
    required: [true, 'Material code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  MaterialName: {
    type: String,
    required: [true, 'Material name is required'],
    unique: true,
    trim: true
  },
  Description: {
    type: String,
    trim: true
  },
  Density: {
    type: Number,
    required: [true, 'Density is required'],
    min: [0.1, 'Density must be greater than 0']
  },
  Unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['g/cm³', 'kg/m³'],
    default: 'g/cm³'
  },
  Standard: {
    type: String,
    trim: true
  },
  Grade: {
    type: String,
    trim: true
  },
  Color: {
    type: String,
    trim: true
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  CreatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  UpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search optimization
materialSchema.index({ MaterialName: 'text', MaterialCode: 'text', Description: 'text' });

module.exports = mongoose.model('Material', materialSchema);