import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaChevronRight, FaChevronDown, FaLink, FaRocket, FaInbox } from 'react-icons/fa';

function FocusMode({ tasks, onToggleTask, onSelectTask, onClose }) {
    const [current, setCurrent] = useState(0);
    const pending = tasks.filter(t => !t.isDone);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (pending[current]) onToggleTask(pending[current]);
            }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                setCurrent(c => Math.min(c + 1, pending.length - 1));
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setCurrent(c => Math.max(c - 1, 0));
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [current, pending, onClose, onToggleTask]);

    if (pending.length === 0) {
        return (
            <div className="focus-overlay" onClick={onClose}>
                <div className="focus-empty" onClick={e => e.stopPropagation()}>
                    <FaRocket size={48} />
                    <h2>All caught up!</h2>
                    <p>No pending tasks. Great work!</p>
                    <button className="focus-exit" onClick={onClose}>Exit Focus Mode</button>
                </div>
            </div>
        );
    }

    const task = pending[current];

    return (
        <div className="focus-overlay">
            <button className="focus-close-btn" onClick={onClose}><FaTimes size={20} /></button>
            <div className="focus-content">
                <div className="focus-progress">
                    <span>{current + 1} / {pending.length}</span>
                    <div className="focus-progress-bar">
                        <div className="focus-progress-fill" style={{ width: `${((current + 1) / pending.length) * 100}%` }} />
                    </div>
                </div>

                <div className="focus-task-card">
                    <div className="focus-priority" data-priority={task.priority}>{task.priority}</div>
                    <h1 className="focus-task-name">{task.taskName}</h1>
                    {task.description && <p className="focus-task-desc">{task.description}</p>}
                    {task.dueDate && (
                        <div className="focus-task-date">
                            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}
                    {task.dependencies?.length > 0 && (
                        <div className="focus-task-deps">
                            <FaLink size={12} /> {task.dependencies.length} dependencies
                        </div>
                    )}
                </div>

                <div className="focus-actions">
                    <button className="focus-action-btn complete" onClick={() => onToggleTask(task)}>
                        <FaCheck /> Complete Task
                    </button>
                    <button className="focus-action-btn detail" onClick={() => { onSelectTask(task); onClose(); }}>
                        <FaChevronRight /> View Details
                    </button>
                </div>

                <div className="focus-nav">
                    <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>← Previous</button>
                    <button disabled={current === pending.length - 1} onClick={() => setCurrent(c => c + 1)}>Next →</button>
                </div>
            </div>
        </div>
    );
}

export default FocusMode;
