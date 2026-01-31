const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id)
        .select('-PasswordHash')
        .populate('RoleID', 'RoleName Description')
        .populate('EmployeeID', 'FirstName LastName Email DepartmentID DesignationID');

      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Check if user is active
      if (req.user.Status !== 'active') {
        return res.status(401).json({ 
          success: false,
          message: 'Account is not active. Please contact administrator.' 
        });
      }

      // Update last login
      req.user.LastLogin = Date.now();
      await req.user.save();

      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token' 
    });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = { protect, generateToken };