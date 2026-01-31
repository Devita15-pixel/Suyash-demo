const express = require('express');
const router = express.Router();
const {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess
} = require('../controllers/processController');
const { protect } = require('../middleware/authMiddleware');
router.use(protect);

router.get('/', getProcesses);
router.get('/:id', getProcess);
router.post('/', createProcess);
router.put('/:id', updateProcess);
router.delete('/:id', deleteProcess);

module.exports = router;