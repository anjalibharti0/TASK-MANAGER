const router = require('express').Router();
const ensureAuthenticated = require('../Middleware/Auth');
const { createSubtask, getSubtasks, updateSubtask, toggleSubtask, deleteSubtask } = require('../Controllers/SubtaskController');

router.get('/:taskId', ensureAuthenticated, getSubtasks);
router.post('/:taskId', ensureAuthenticated, createSubtask);
router.put('/:id', ensureAuthenticated, updateSubtask);
router.patch('/:id/toggle', ensureAuthenticated, toggleSubtask);
router.delete('/:id', ensureAuthenticated, deleteSubtask);

module.exports = router;
