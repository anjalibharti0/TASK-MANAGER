const SubtaskModel = require('../Models/SubtaskModel');
const TaskModel = require('../Models/TaskModel');

const getSubtasks = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await TaskModel.findOne({ _id: taskId, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
        }

        const subtasks = await SubtaskModel.find({ taskId, userId: req.user._id }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: subtasks });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching subtasks", error: err.message });
    }
};

const createSubtask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { taskName, isDone } = req.body;

        const task = await TaskModel.findOne({ _id: taskId, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found or unauthorized" });
        }

        const subtask = new SubtaskModel({
            taskName,
            isDone: isDone || false,
            taskId,
            userId: req.user._id
        });
        await subtask.save();

        res.status(201).json({ success: true, message: "Subtask created", data: subtask });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating subtask", error: err.message });
    }
};

const updateSubtask = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const subtask = await SubtaskModel.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { $set: body },
            { new: true }
        );

        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Subtask updated", data: subtask });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating subtask", error: err.message });
    }
};

const toggleSubtask = async (req, res) => {
    try {
        const { id } = req.params;

        const subtask = await SubtaskModel.findOne({ _id: id, userId: req.user._id });
        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found or unauthorized" });
        }

        subtask.isDone = !subtask.isDone;
        await subtask.save();

        res.status(200).json({ success: true, message: "Subtask toggled", data: subtask });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error toggling subtask", error: err.message });
    }
};

const deleteSubtask = async (req, res) => {
    try {
        const { id } = req.params;

        const subtask = await SubtaskModel.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found or unauthorized" });
        }

        res.status(200).json({ success: true, message: "Subtask deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting subtask", error: err.message });
    }
};

module.exports = { getSubtasks, createSubtask, updateSubtask, toggleSubtask, deleteSubtask };
