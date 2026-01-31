const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  PartNo: {
    type: String,
    required: [true, 'Part number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  PartName: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  Description: {
    type: String,
    trim: true
  },
  DrawingNo: {
    type: String,
    trim: true
  },
  RevisionNo: {
    type: String,
    trim: true,
    default: 'A'
  },
  Unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['Nos', 'Kg', 'Meter', 'Set', 'Piece'],
    default: 'Nos'
  },
  HSNCode: {
    type: String,
    required: [true, 'HSN code is required']
  },
  MaterialID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'Material is required']
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

// Indexes for search optimization
itemSchema.index({ PartNo: 'text', PartName: 'text', Description: 'text', DrawingNo: 'text' });
itemSchema.index({ MaterialID: 1 });
itemSchema.index({ IsActive: 1 });

// Virtual field to get material name
itemSchema.virtual('MaterialName').get(function() {
  return this.MaterialID ? this.MaterialID.MaterialName : null;
});

// Virtual field to get material code
itemSchema.virtual('MaterialCode').get(function() {
  return this.MaterialID ? this.MaterialID.MaterialCode : null;
});

// Populate material by default when querying
itemSchema.pre('find', function() {
  this.populate('MaterialID', 'MaterialCode MaterialName Description Density Unit');
});

itemSchema.pre('findOne', function() {
  this.populate('MaterialID', 'MaterialCode MaterialName Description Density Unit');
});

module.exports = mongoose.model('Item', itemSchema);