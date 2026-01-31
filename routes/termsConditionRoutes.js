const express = require('express');
const router = express.Router();
const {
  getTermsConditions,
  getTermsCondition,
  createTermsCondition,
  updateTermsCondition,
  deleteTermsCondition
} = require('../controllers/termsConditionController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/', getTermsConditions);
router.get('/:id', getTermsCondition);
router.post('/', createTermsCondition);
router.put('/:id', updateTermsCondition);
router.delete('/:id', deleteTermsCondition);

module.exports = router;