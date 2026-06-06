const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
    isDone: {
        type: Boolean,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Work', 'Personal', 'Health', 'Other'],
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    dependencies: [{
        type: Schema.Types.ObjectId,
        ref: 'todos'
    }]
});

const TaskModel = mongoose.model('todos', TaskSchema);
module.exports = TaskModel;