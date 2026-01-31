const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  reactivateItem,
  getItemsByMaterial
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection to all routes
router.use(protect);

router.get('/', getItems);
router.get('/material/:materialId', getItemsByMaterial);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.put('/:id/reactivate', reactivateItem);

module.exports = router;