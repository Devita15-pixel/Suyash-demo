const express = require('express');
const router = express.Router();
const {
  getDimensionWeights,
  getDimensionWeight,
  createDimensionWeight,
  updateDimensionWeight,
  deleteDimensionWeight
} = require('../controllers/dimensionWeightController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect,getDimensionWeights);
router.get('/:id', protect,getDimensionWeight);
router.post('/',protect, createDimensionWeight);
router.put('/:id',protect, updateDimensionWeight);
router.delete('/:id',protect, deleteDimensionWeight);

module.exports = router;