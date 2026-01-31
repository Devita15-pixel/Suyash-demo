const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  getCurrentRates,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} = require('../controllers/rawMaterialController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);

router.get('/', getRawMaterials);
router.get('/current-rates', getCurrentRates);
router.get('/:id', getRawMaterial);
router.post('/', createRawMaterial);
router.put('/:id', updateRawMaterial);
router.delete('/:id', deleteRawMaterial);

module.exports = router;