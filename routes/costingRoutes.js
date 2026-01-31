const express = require('express');
const router = express.Router();
const {
  getCostings,
  getCosting,
  createCosting,
  updateCosting,
  deleteCosting
} = require('../controllers/costingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect,getCostings);
router.get('/:id', protect,getCosting);
router.post('/', protect,createCosting);
router.put('/:id',protect, updateCosting);
router.delete('/:id',protect, deleteCosting);

module.exports = router;