const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const { setupSwagger } = require('./config/swagger'); // CHANGED THIS

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

// Enable CORS - Allow all origins for testing on any IP
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Setup Swagger with dynamic configuration
setupSwagger(app); // CHANGED THIS

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
    documentation: {
      swagger: `${req.protocol}://${req.get('host')}/api-docs`,
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
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    server_ip: req.ip,
    client_ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
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

const PORT = process.env.PORT || 5009;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  const address = server.address();
  const host = address.address === '::' ? 'localhost' : address.address;
  const port = address.port;
  
  console.log(`✅ Server running`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 MongoDB URI: ${process.env.MONGODB_URI}`);
  console.log(`\n🔗 Available on multiple URLs:`);
  console.log(`   Local:        http://localhost:${port}`);
  console.log(`   Network:      http://${host}:${port}`);
  console.log(`   Any IP:       http://0.0.0.0:${port}`);
  console.log(`\n📚 Swagger Documentation:`);
  console.log(`   Main Docs:    http://localhost:${port}/api-docs`);
  console.log(`   Network Docs: http://${host}:${port}/api-docs`);
  console.log(`\n🩺 Health Check:`);
  console.log(`   Status:       http://localhost:${port}/health`);
  console.log(`\n👥 Employee Management System:`);
  console.log(`   Auth:         http://localhost:${port}/api/auth`);
  console.log(`   Employees:    http://localhost:${port}/api/employees`);
  console.log(`\n📊 Quotation/CRM System:`);
  console.log(`   Quotations:   http://localhost:${port}/api/quotations`);
  console.log(`   Customers:    http://localhost:${port}/api/customers`);
  console.log(`   Materials:    http://localhost:${port}/api/materials`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});