import React, { useState } from 'react';
import { FaCheck, FaPlus, FaTrash } from 'react-icons/fa';
import { CreateSubtask, ToggleSubtask, DeleteSubtask } from '../api';
import { notify } from '../utils';

function SubtaskList({ taskId, subtasks, onUpdate }) {
    const [newSubtask, setNewSubtask] = useState('');

    const handleAdd = async () => {
        if (!newSubtask.trim()) return;
        const res = await CreateSubtask(taskId, { taskName: newSubtask.trim() });
        if (res && res.success) {
            notify('Subtask added', 'success');
            setNewSubtask('');
            onUpdate();
        } else {
            notify(res?.message || 'Failed to add subtask', 'error');
        }
    };

    const handleToggle = async (id) => {
        const res = await ToggleSubtask(id);
        if (res && res.success) {
            onUpdate();
        }
    };

    const handleDelete = async (id) => {
        const res = await DeleteSubtask(id);
        if (res && res.success) {
            notify('Subtask deleted', 'success');
            onUpdate();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const doneCount = subtasks.filter(s => s.isDone).length;
    const progress = subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0;

    return (
        <div className="subtask-list">
            {subtasks.length > 0 && (
                <div className="subtask-progress mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-secondary">
                            {doneCount}/{subtasks.length} subtasks
                        </small>
                        <small className="text-secondary">
                            {Math.round(progress)}%
                        </small>
                    </div>
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="subtask-input-row mb-2">
                <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a subtask..."
                    className="subtask-input"
                />
                <button onClick={handleAdd} className="subtask-add-btn">
                    <FaPlus size={10} />
                </button>
            </div>

            <div className="subtask-items">
                {subtasks.map((st) => (
                    <div key={st._id} className="subtask-item">
                        <button
                            className={`subtask-check ${st.isDone ? 'done' : ''}`}
                            onClick={() => handleToggle(st._id)}
                        >
                            {st.isDone && <FaCheck size={8} />}
                        </button>
                        <span className={st.isDone ? 'subtask-done' : ''}>
                            {st.taskName}
                        </span>
                        <button
                            className="subtask-delete"
                            onClick={() => handleDelete(st._id)}
                        >
                            <FaTrash size={10} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SubtaskList;
