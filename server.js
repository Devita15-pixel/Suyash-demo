const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Import route files
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const roleRoutes = require('./routes/roleRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const designationRoutes = require('./routes/designationRoutes');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leavetypes', leaveTypeRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Employee Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      roles: '/api/roles',
      departments: '/api/departments',
      designations: '/api/designations',
      leaveTypes: '/api/leavetypes'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log('\n🔗 Available endpoints:');
  console.log(`   Home:        http://localhost:${PORT}/`);
  console.log(`   Health:      http://localhost:${PORT}/health`);
  console.log(`   Auth:        http://localhost:${PORT}/api/auth`);
  console.log(`   Employees:   http://localhost:${PORT}/api/employees`);
  console.log(`   Roles:       http://localhost:${PORT}/api/roles`);
  console.log(`   Departments: http://localhost:${PORT}/api/departments`);
  console.log(`   Designations: http://localhost:${PORT}/api/designations`);
  console.log(`   Leave Types: http://localhost:${PORT}/api/leavetypes`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});