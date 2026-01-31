const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect,getCompanies);
router.get('/:id',protect, getCompany);
router.post('/',protect, createCompany);
router.put('/:id', protect,updateCompany);
router.delete('/:id',protect, deleteCompany);

module.exports = router;