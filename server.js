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
const companyRoutes = require('./routes/companyRoutes');
// New routes
const costingRoutes = require('./routes/costingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dimensionWeightRoutes = require('./routes/dimensionWeightRoutes');
const itemRoutes = require('./routes/itemRoutes');
const processRoutes = require('./routes/processRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const taxRoutes = require('./routes/taxRoutes');
const termsConditionRoutes = require('./routes/termsConditionRoutes');
const materialRoutes = require('./routes/materialRoutes');

const app = express();
// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers - Employee Management System
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/leavetypes', leaveTypeRoutes);
app.use('/api/company', companyRoutes);

// Mount routers - New Quotation/CRM System
app.use('/api/costings', costingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dimension-weights', dimensionWeightRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/terms-conditions', termsConditionRoutes);
app.use('/api/materials', materialRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Employee Management & Quotation System API',
    version: '1.0.0',
    endpoints: {
      // Employee Management System
      auth: '/api/auth',
      employees: '/api/employees',
      roles: '/api/roles',
      departments: '/api/departments',
      designations: '/api/designations',
      leaveTypes: '/api/leavetypes',
      company: '/api/company',
      // Quotation/CRM System
      costings: '/api/costings',
      customers: '/api/customers',
      dimensionWeights: '/api/dimension-weights',
      items: '/api/items',
      processes: '/api/processes',
      quotations: '/api/quotations',
      rawMaterials: '/api/raw-materials',
      taxes: '/api/taxes',
      termsConditions: '/api/terms-conditions'
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
  console.log(`   Home:              http://localhost:${PORT}/`);
  console.log(`   Health:            http://localhost:${PORT}/health`);
  console.log('\n👥 Employee Management System:');
  console.log(`   Auth:              http://localhost:${PORT}/api/auth`);
  console.log(`   Employees:         http://localhost:${PORT}/api/employees`);
  console.log(`   Roles:             http://localhost:${PORT}/api/roles`);
  console.log(`   Departments:       http://localhost:${PORT}/api/departments`);
  console.log(`   Designations:      http://localhost:${PORT}/api/designations`);
  console.log(`   Leave Types:       http://localhost:${PORT}/api/leavetypes`);
  console.log(`   Company:           http://localhost:${PORT}/api/company`);
  console.log('\n📊 Quotation/CRM System:');
  console.log(`   Costings:          http://localhost:${PORT}/api/costings`);
  console.log(`   Customers:         http://localhost:${PORT}/api/customers`);
  console.log(`   Dimension Weights: http://localhost:${PORT}/api/dimension-weights`);
  console.log(`   Items:             http://localhost:${PORT}/api/items`);
  console.log(`   Processes:         http://localhost:${PORT}/api/processes`);
  console.log(`   Quotations:        http://localhost:${PORT}/api/quotations`);
  console.log(`   Raw Materials:     http://localhost:${PORT}/api/raw-materials`);
  console.log(`   Taxes:             http://localhost:${PORT}/api/taxes`);
  console.log(`   Terms & Conditions: http://localhost:${PORT}/api/terms-conditions`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});