const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  approveQuotation,
  deleteQuotation,
  getQuotationStats
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);

router.get('/', getQuotations);
router.get('/stats', getQuotationStats);
router.get('/:id', getQuotation);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.put('/:id/approve', approveQuotation);
router.delete('/:id', deleteQuotation);

module.exports = router;