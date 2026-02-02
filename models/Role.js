const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  RoleName: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    maxlength: 100
  },
  Description: {
    type: String,
    trim: true,
    maxlength: 500
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
  timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' }
});

// Add indexes
roleSchema.index({ RoleName: 1 });
roleSchema.index({ IsActive: 1 });
roleSchema.index({ CreatedAt: -1 });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;