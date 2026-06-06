const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubtaskSchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'todos',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const SubtaskModel = mongoose.model('subtasks', SubtaskSchema);
module.exports = SubtaskModel;