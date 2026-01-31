const express = require('express');
const router = express.Router();
const {
  getTaxes,
  getTax,
  createTax,
  updateTax,
  deleteTax
} = require('../controllers/taxController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);

router.get('/', getTaxes);
router.get('/:id', getTax);
router.post('/', createTax);
router.put('/:id', updateTax);
router.delete('/:id', deleteTax);

module.exports = router;