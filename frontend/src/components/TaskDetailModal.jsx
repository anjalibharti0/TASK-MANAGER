import React, { useState } from 'react';
import { FaCalendarAlt, FaLink, FaUnlink, FaTimes } from 'react-icons/fa';
import SubtaskList from './SubtaskList';
import { AddDependency, RemoveDependency, UpdateTaskById } from '../api';
import { notify } from '../utils';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const CATEGORY_OPTIONS = ['Work', 'Personal', 'Health', 'Other'];

function TaskDetailModal({ task, allTasks, onClose, onUpdate }) {
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority || 'medium');
    const [category, setCategory] = useState(task.category || 'Other');
    const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
    const [depSearch, setDepSearch] = useState('');

    const handleSaveField = async (field, value) => {
        const res = await UpdateTaskById(task._id, { [field]: value });
        if (res && res.success) {
            notify(`${field} updated`, 'success');
            onUpdate();
        }
    };

    const handleAddDep = async (depId) => {
        const res = await AddDependency(task._id, depId);
        if (res && res.success) {
            notify('Dependency added', 'success');
            setDepSearch('');
            onUpdate();
        } else {
            notify(res?.message || 'Failed to add dependency', 'error');
        }
    };

    const handleRemoveDep = async (depId) => {
        const res = await RemoveDependency(task._id, depId);
        if (res && res.success) {
            notify('Dependency removed', 'success');
            onUpdate();
        }
    };

    const availableDeps = allTasks.filter(
        (t) =>
            t._id !== task._id &&
            !task.dependencies?.some((d) => (d._id || d) === t._id) &&
            t.taskName.toLowerCase().includes(depSearch.toLowerCase())
    );

    const currentDeps = task.dependencies || [];
    const isBlocked = currentDeps.length > 0 && currentDeps.some((d) => (d.isDone === false));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{task.taskName}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {isBlocked && (
                        <div className="blocked-banner">
                            Blocked by incomplete dependencies
                        </div>
                    )}

                    <div className="detail-section">
                        <label>Priority</label>
                        <div className="detail-inline">
                            {PRIORITY_OPTIONS.map((p) => (
                                <button
                                    key={p}
                                    className={`priority-btn ${p} ${priority === p ? 'active' : ''}`}
                                    onClick={() => { setPriority(p); handleSaveField('priority', p); }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <label>Category</label>
                        <div className="detail-inline">
                            {CATEGORY_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    className={`category-btn ${category === c ? 'active' : ''}`}
                                    onClick={() => { setCategory(c); handleSaveField('category', c); }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="detail-section">
                        <label><FaCalendarAlt className="me-1" /> Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => { setDueDate(e.target.value); handleSaveField('dueDate', e.target.value || null); }}
                            className="detail-date-input"
                        />
                    </div>

                    <div className="detail-section">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={() => handleSaveField('description', description)}
                            placeholder="Add a description..."
                            className="detail-textarea"
                            rows={3}
                        />
                    </div>

                    <div className="detail-section">
                        <label><FaLink className="me-1" /> Dependencies</label>
                        {currentDeps.length > 0 && (
                            <div className="dep-list mb-2">
                                {currentDeps.map((dep) => (
                                    <div key={dep._id} className={`dep-item ${dep.isDone ? 'dep-done' : 'dep-pending'}`}>
                                        <span>{dep.taskName}</span>
                                        <button onClick={() => handleRemoveDep(dep._id)}>
                                            <FaUnlink size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input
                            type="text"
                            value={depSearch}
                            onChange={(e) => setDepSearch(e.target.value)}
                            placeholder="Search tasks to add as dependency..."
                            className="detail-input mb-1"
                        />
                        {depSearch && availableDeps.length > 0 && (
                            <div className="dep-suggestions">
                                {availableDeps.slice(0, 5).map((t) => (
                                    <div
                                        key={t._id}
                                        className="dep-suggestion-item"
                                        onClick={() => handleAddDep(t._id)}
                                    >
                                        {t.taskName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <label>Subtasks</label>
                        <SubtaskList
                            taskId={task._id}
                            subtasks={task.subtasks || []}
                            onUpdate={onUpdate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailModal;
