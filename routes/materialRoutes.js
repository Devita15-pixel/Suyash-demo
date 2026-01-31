const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getActiveMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  reactivateMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all routes
router.use(protect);

router.get('/', getMaterials);
router.get('/active', getActiveMaterials);
router.get('/:id', getMaterial);
router.post('/', createMaterial);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);
router.put('/:id/reactivate', reactivateMaterial);

module.exports = router;