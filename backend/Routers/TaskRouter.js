const router = require('express').Router();
const ensureAuthenticated = require('../Middleware/Auth');
const {
    createTask,
    fetchAllTasks,
    updateTaskById,
    deleteTaskById,
    getTaskStats,
    addDependency,
    removeDependency
} = require('../Controllers/TaskController');

router.get('/stats', ensureAuthenticated, getTaskStats);
router.get('/', ensureAuthenticated, fetchAllTasks);
router.post("/", ensureAuthenticated, createTask);
router.put("/:id", ensureAuthenticated, updateTaskById);
router.delete("/:id", ensureAuthenticated, deleteTaskById);
router.post("/:id/dependencies", ensureAuthenticated, addDependency);
router.delete("/:id/dependencies/:depId", ensureAuthenticated, removeDependency);

module.exports = router;
