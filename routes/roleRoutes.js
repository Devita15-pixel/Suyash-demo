const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRoleStats,
  getRolesDropdown
} = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);

// Public routes - no authentication required
router.get('/', getRoles);
router.get('/stats', getRoleStats);
router.get('/dropdown', getRolesDropdown);
router.get('/:id', getRole);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;