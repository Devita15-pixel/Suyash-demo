const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes are protected
router.use(protect);

// Routes accessible by Admin, HR, and Manager
router.get('/', protect, getEmployees);
router.get('/stats', protect, getEmployeeStats);

// Routes accessible by all authenticated users
router.get('/:id', protect,getEmployee);

// Routes accessible only by Admin and HR
router.post('/', protect,createEmployee);
router.put('/:id', protect, updateEmployee);
router.delete('/:id',protect,deleteEmployee);

module.exports = router;