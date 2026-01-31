const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  DepartmentName: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  Description: {
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

// Pre-save middleware to update UpdatedAt
departmentSchema.pre('save', function(next) {
  this.UpdatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Department', departmentSchema);