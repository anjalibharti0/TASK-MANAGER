const TaskModel = require("../Models/TaskModel");
const SubtaskModel = require("../Models/SubtaskModel");

const createTask = async (req, res) => {
    try {
        const { taskName, isDone, category, priority, dueDate, description } = req.body;
        const model = new TaskModel({
            taskName,
            isDone,
            category: category || 'Other',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            description: description || '',
            userId: req.user._id
        });
        await model.save();

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: model
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

const fetchAllTasks = async (req, res) => {
    try {
        const data = await TaskModel.find({ userId: req.user._id })
            .populate('dependencies', 'taskName isDone')
            .sort({ priority: 1, dueDate: 1 });

        const tasksWithSubtasks = await Promise.all(
            data.map(async (task) => {
                const subtasks = await SubtaskModel.find({ taskId: task._id, userId: req.user._id });
                const doneCount = subtasks.filter(s => s.isDone).length;
                return {
                    ...task.toObject(),
                    subtasks,
                    subtaskStats: { total: subtasks.length, done: doneCount }
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: tasksWithSubtasks
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching tasks",
            error: err.message
        });
    }
};

const updateTaskById = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const obj = { $set: { ...body } };

        const updatedTask = await TaskModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            obj,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized"
            });
        }

        const data = await TaskModel.find({ userId: req.user._id });

        res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error updating task",
            error: err.message || err
        });
    }
};

const deleteTaskById = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedTask = await TaskModel.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: "Task not found or unauthorized"
            });
        }

        await SubtaskModel.deleteMany({ taskId: id, userId: req.user._id });

        await TaskModel.updateMany(
            { userId: req.user._id, dependencies: id },
            { $pull: { dependencies: id } }
        );

        res.status(200).json({
            message: 'Task is deleted',
            success: true
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete task',
            success: false
        });
    }
};

const addDependency = async (req, res) => {
    try {
        const { id } = req.params;
        const { dependsOnId } = req.body;

        if (id === dependsOnId) {
            return res.status(400).json({ success: false, message: "A task cannot depend on itself" });
        }

        const task = await TaskModel.findOne({ _id: id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
        }

        const dependsOn = await TaskModel.findOne({ _id: dependsOnId, userId: req.user._id });
        if (!dependsOn) {
            return res.status(404).json({ success: false, message: "Dependency task not found" });
        }

        if (task.dependencies.includes(dependsOnId)) {
            return res.status(400).json({ success: false, message: "Dependency already exists" });
        }

        const wouldCycle = await checkCircularDependency(id, dependsOnId, req.user._id);
        if (wouldCycle) {
            return res.status(400).json({ success: false, message: "Adding this dependency would create a circular chain" });
        }

        task.dependencies.push(dependsOnId);
        await task.save();

        res.status(200).json({ success: true, message: "Dependency added", data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error adding dependency", error: err.message });
    }
};

const removeDependency = async (req, res) => {
    try {
        const { id, depId } = req.params;

        const task = await TaskModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $pull: { dependencies: depId } },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Dependency removed", data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error removing dependency", error: err.message });
    }
};

const checkCircularDependency = async (taskId, newDepId, userId) => {
    const visited = new Set([taskId]);
    let queue = [newDepId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        if (currentId.toString() === taskId.toString()) return true;
        if (visited.has(currentId.toString())) continue;
        visited.add(currentId.toString());

        const task = await TaskModel.findOne({ _id: currentId, userId });
        if (task && task.dependencies.length > 0) {
            queue = queue.concat(task.dependencies.map(d => d.toString()));
        }
    }
    return false;
};

const getTaskStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalTasks = await TaskModel.countDocuments({ userId });
        const completedTasks = await TaskModel.countDocuments({ userId, isDone: true });
        const pendingTasks = totalTasks - completedTasks;

        const highPriority = await TaskModel.countDocuments({ userId, priority: 'high', isDone: false });
        const mediumPriority = await TaskModel.countDocuments({ userId, priority: 'medium', isDone: false });
        const lowPriority = await TaskModel.countDocuments({ userId, priority: 'low', isDone: false });

        const categoryStats = await TaskModel.aggregate([
            { $match: { userId } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const now = new Date();
        const overdueTasks = await TaskModel.countDocuments({
            userId,
            isDone: false,
            dueDate: { $lt: now }
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const completedPerDay = await TaskModel.aggregate([
            { $match: { userId, isDone: true, updatedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalSubtasks = await SubtaskModel.countDocuments({ userId });
        const completedSubtasks = await SubtaskModel.countDocuments({ userId, isDone: true });

        res.status(200).json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                highPriority,
                mediumPriority,
                lowPriority,
                categoryStats,
                completedPerDay,
                subtaskStats: { total: totalSubtasks, done: completedSubtasks }
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching stats",
            error: err.message
        });
    }
};

module.exports = {
    createTask,
    fetchAllTasks,
    updateTaskById,
    deleteTaskById,
    getTaskStats,
    addDependency,
    removeDependency
};
