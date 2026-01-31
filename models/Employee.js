const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  EmployeeID: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  FirstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 50
  },
  LastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 50
  },
  Gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['M', 'F', 'O'],
    uppercase: true
  },
  DateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  Email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  Phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: 15
  },
  Address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  DepartmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  DesignationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation',
    required: true
  },
  DateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  EmploymentStatus: {
    type: String,
    required: true,
    enum: ['active', 'resigned', 'terminated', 'retired'],
    default: 'active'
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

// Virtual for full name
employeeSchema.virtual('FullName').get(function() {
  return `${this.FirstName} ${this.LastName}`;
});

// Ensure virtuals are included in JSON output
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update UpdatedAt
employeeSchema.pre('save', function(next) {
  this.UpdatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);