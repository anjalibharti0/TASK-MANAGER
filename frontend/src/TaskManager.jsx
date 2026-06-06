import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaCheck, FaChevronDown, FaChevronRight, FaLink, FaPencilAlt, FaPlus, FaSearch, FaTrash, FaInbox, FaRocket, FaBullseye, FaHistory, FaKeyboard, FaEllipsisV, FaGripVertical } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CreateTask, DeleteTaskById, GetAllTasks, UpdateTaskById } from './api';
import { notify } from './utils';
import TaskDetailModal from './components/TaskDetailModal';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';
import ActivityLog, { logActivity } from './components/ActivityLog';
import KeyboardShortcuts from './components/KeyboardShortcuts';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
const CATEGORY_OPTIONS = ['Work', 'Personal', 'Health', 'Other'];

function TaskManager({ theme, onToggleTheme }) {
    const [copyTasks, setCopyTasks] = useState([]);
    const [input, setInput] = useState('');
    const [updateTask, setUpdateTask] = useState(null);
    const [userName, setUserName] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPriority, setNewPriority] = useState('medium');
    const [newCategory, setNewCategory] = useState('Other');
    const [newDueDate, setNewDueDate] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCmdPalette, setShowCmdPalette] = useState(false);
    const [showFocusMode, setShowFocusMode] = useState(false);
    const [showActivityLog, setShowActivityLog] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        notify('Logged out successfully', 'success');
        setTimeout(() => navigate('/login'), 800);
    }, [navigate]);

    const fetchAllTasks = useCallback(async () => {
        const response = await GetAllTasks();
        if (response && response.success === false && response.message?.toLowerCase().includes('unauthorized')) {
            notify("Session expired. Please login again.", 'error');
            handleLogout();
            return;
        }
        if (response && response.success) {
            setCopyTasks(response.data || []);
        } else {
            setCopyTasks([]);
        }
    }, [handleLogout]);

    useEffect(() => {
        setUserName(localStorage.getItem('loggedInUser') || 'User');
        fetchAllTasks();
    }, [fetchAllTasks]);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const target = e.target;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowCmdPalette(prev => !prev);
                return;
            }

            if (e.key === 'Escape') {
                if (showCmdPalette) setShowCmdPalette(false);
                else if (showFocusMode) setShowFocusMode(false);
                else if (showActivityLog) setShowActivityLog(false);
                else if (showShortcuts) setShowShortcuts(false);
                else if (selectedTask) setSelectedTask(null);
                return;
            }

            if (isInput) return;

            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                setShowCreateForm(true);
                setTimeout(() => document.querySelector('.tm-input')?.focus(), 100);
            }
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                setShowFocusMode(prev => !prev);
            }
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                onToggleTheme();
            }
            if (e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                navigate('/dashboard');
            }
            if (e.key === '/') {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === '?') {
                e.preventDefault();
                setShowShortcuts(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showCmdPalette, showFocusMode, showActivityLog, showShortcuts, selectedTask, onToggleTheme, navigate]);

    const handleAddTask = async () => {
        if (!input.trim()) return;
        const obj = {
            taskName: input.trim(),
            isDone: false,
            priority: newPriority,
            category: newCategory,
            dueDate: newDueDate || null,
            description: newDescription
        };
        const response = await CreateTask(obj);
        if (response && response.success === false && response.message?.toLowerCase().includes('unauthorized')) {
            notify("Session expired. Please login again.", 'error');
            handleLogout();
            return;
        }
        if (response && response.success) {
            notify(response.message, 'success');
            logActivity('created', `Created task "${input.trim()}"`);
            setInput('');
            setNewPriority('medium');
            setNewCategory('Other');
            setNewDueDate('');
            setNewDescription('');
            setShowCreateForm(false);
        } else {
            notify(response?.message || 'Failed to add task', 'error');
        }
        fetchAllTasks();
    };

    const handleDeleteTask = async (id) => {
        const task = copyTasks.find(t => t._id === id);
        const response = await DeleteTaskById(id);
        if (response && response.success === false && response.message?.toLowerCase().includes('unauthorized')) {
            notify("Session expired. Please login again.", 'error');
            handleLogout();
            return;
        }
        if (response && response.success) {
            notify(response.message, 'success');
            logActivity('deleted', `Deleted task "${task?.taskName || 'Unknown'}"`);
            if (selectedTask?._id === id) setSelectedTask(null);
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        } else {
            notify(response?.message || 'Failed to delete task', 'error');
        }
        fetchAllTasks();
    };

    const handleCheckAndUncheck = async (item) => {
        const obj = { taskName: item.taskName, isDone: !item.isDone };
        const response = await UpdateTaskById(item._id, obj);
        if (response && response.success === false && response.message?.toLowerCase().includes('unauthorized')) {
            notify("Session expired. Please login again.", 'error');
            handleLogout();
            return;
        }
        if (response && response.success) {
            if (!item.isDone) {
                fireConfetti();
                logActivity('completed', `Completed task "${item.taskName}"`);
            } else {
                logActivity('uncompleted', `Reopened task "${item.taskName}"`);
            }
            fetchAllTasks();
            if (selectedTask?._id === item._id) {
                setSelectedTask(prev => ({ ...prev, isDone: !prev.isDone }));
            }
        }
    };

    const handleUpdateItem = async () => {
        if (!updateTask || !input.trim()) return;
        const obj = { taskName: input.trim(), isDone: updateTask.isDone };
        const response = await UpdateTaskById(updateTask._id, obj);
        if (response && response.success) {
            notify(response.message, 'success');
            logActivity('updated', `Updated task "${input.trim()}"`);
            setUpdateTask(null);
            setInput('');
        }
        fetchAllTasks();
    };

    // Bulk actions
    const handleSelectAll = () => {
        if (selectedIds.size === filteredTasks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredTasks.map(t => t._id)));
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    };

    const handleBulkComplete = async () => {
        for (const id of selectedIds) {
            const task = copyTasks.find(t => t._id === id);
            if (task && !task.isDone) {
                await UpdateTaskById(id, { taskName: task.taskName, isDone: true });
                logActivity('completed', `Bulk completed task "${task.taskName}"`);
            }
        }
        setSelectedIds(new Set());
        fetchAllTasks();
    };

    const handleBulkDelete = async () => {
        for (const id of selectedIds) {
            const task = copyTasks.find(t => t._id === id);
            await DeleteTaskById(id);
            logActivity('deleted', `Bulk deleted task "${task?.taskName || 'Unknown'}"`);
        }
        setSelectedIds(new Set());
        fetchAllTasks();
    };

    // Drag and drop
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, id) => {
        e.preventDefault();
        if (id !== draggedId) setDragOverId(id);
    };

    const handleDrop = (e, targetId) => {
        e.preventDefault();
        setDragOverId(null);
        setDraggedId(null);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    // Command palette actions
    const handleCmdAction = (actionId, data) => {
        switch (actionId) {
            case 'new-task':
                setShowCreateForm(true);
                setTimeout(() => document.querySelector('.tm-input')?.focus(), 100);
                break;
            case 'toggle-theme':
                onToggleTheme();
                break;
            case 'dashboard':
                navigate('/dashboard');
                break;
            case 'focus-mode':
                setShowFocusMode(true);
                break;
            case 'shortcuts':
                setShowShortcuts(true);
                break;
            case 'logout':
                handleLogout();
                break;
            case 'open-task': {
                const task = copyTasks.find(t => t._id === data);
                if (task) setSelectedTask(task);
                break;
            }
            default:
                break;
        }
    };

    const applyFilters = (tasksList, search, priority, category, status) => {
        return tasksList.filter((t) => {
            const matchSearch = t.taskName.toLowerCase().includes(search.toLowerCase());
            const matchPriority = priority === 'all' || t.priority === priority;
            const matchCategory = category === 'all' || t.category === category;
            let matchStatus = true;
            if (status === 'completed') matchStatus = t.isDone;
            else if (status === 'pending') matchStatus = !t.isDone;
            else if (status === 'overdue') matchStatus = !t.isDone && t.dueDate && new Date(t.dueDate) < new Date();
            else if (status === 'blocked') matchStatus = t.dependencies?.some(d => !d.isDone);
            return matchSearch && matchPriority && matchCategory && matchStatus;
        });
    };

    const filteredTasks = applyFilters(copyTasks, searchTerm, filterPriority, filterCategory, filterStatus);

    const isOverdue = (task) => !task.isDone && task.dueDate && new Date(task.dueDate) < new Date();
    const isBlocked = (task) => task.dependencies?.some(d => !d.isDone);

    const fireConfetti = () => {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
        confetti({ ...defaults, particleCount: 40, origin: { x: 0.3, y: 0.7 } });
        confetti({ ...defaults, particleCount: 40, origin: { x: 0.7, y: 0.7 } });
    };

    const getPriorityColor = (p) => {
        if (p === 'high') return '#ef4444';
        if (p === 'medium') return '#f59e0b';
        return '#10b981';
    };

    const getCategoryColor = (c) => {
        const map = { Work: '#6366f1', Personal: '#ec4899', Health: '#10b981', Other: '#8b5cf6' };
        return map[c] || '#8b5cf6';
    };

    const stats = {
        total: copyTasks.length,
        done: copyTasks.filter(t => t.isDone).length,
        pending: copyTasks.filter(t => !t.isDone).length,
        overdue: copyTasks.filter(t => !t.isDone && t.dueDate && new Date(t.dueDate) < new Date()).length,
    };

    return (
        <div className="task-manager">
            <div className="tm-header">
                <div className="tm-welcome">
                    <h4>Welcome, <span className="text-primary fw-bold">{userName}</span></h4>
                </div>
                <div className="tm-header-actions">
                    <div className="tm-quick-stats">
                        <span className="quick-stat done">{stats.done} done</span>
                        <span className="quick-stat pending">{stats.pending} pending</span>
                        {stats.overdue > 0 && <span className="quick-stat overdue">{stats.overdue} overdue</span>}
                    </div>
                    <button onClick={() => setShowActivityLog(true)} className="tm-icon-btn" title="Activity Log">
                        <FaHistory />
                    </button>
                    <button onClick={() => setShowFocusMode(true)} className="tm-icon-btn" title="Focus Mode (F)">
                        <FaBullseye />
                    </button>
                    <button onClick={() => setShowShortcuts(true)} className="tm-icon-btn" title="Shortcuts (?)">
                        <FaKeyboard />
                    </button>
                    <button onClick={() => setShowCmdPalette(true)} className="tm-cmd-trigger" title="Command Palette (Ctrl+K)">
                        <FaSearch size={12} />
                        <span>Search...</span>
                        <kbd>⌘K</kbd>
                    </button>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>

            <h1 className="tm-title">Task Manager</h1>

            <div className="tm-actions">
                <div className="tm-input-row">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (updateTask ? handleUpdateItem() : handleAddTask())}
                        placeholder={updateTask ? 'Edit Task' : 'Add a new Task (N)'}
                        className="tm-input"
                    />
                    {updateTask ? (
                        <>
                            <button onClick={handleUpdateItem} className="tm-btn tm-btn-primary">
                                <FaPencilAlt /> Update
                            </button>
                            <button onClick={() => { setUpdateTask(null); setInput(''); }} className="tm-btn tm-btn-secondary">
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setShowCreateForm(!showCreateForm)} className="tm-btn tm-btn-success">
                            <FaPlus /> New Task
                        </button>
                    )}
                </div>

                {showCreateForm && !updateTask && (
                    <div className="create-form">
                        <div className="create-form-fields">
                            <div className="form-row">
                                <label>Priority</label>
                                <div className="btn-group-mini">
                                    {PRIORITY_OPTIONS.map(p => (
                                        <button
                                            key={p}
                                            className={`priority-btn ${p} ${newPriority === p ? 'active' : ''}`}
                                            onClick={() => setNewPriority(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Category</label>
                                <div className="btn-group-mini">
                                    {CATEGORY_OPTIONS.map(c => (
                                        <button
                                            key={c}
                                            className={`category-btn ${newCategory === c ? 'active' : ''}`}
                                            onClick={() => setNewCategory(c)}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={newDueDate}
                                    onChange={(e) => setNewDueDate(e.target.value)}
                                    className="tm-date-input"
                                />
                            </div>
                            <div className="form-row full-width">
                                <label>Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    className="tm-textarea"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <button onClick={handleAddTask} className="tm-btn tm-btn-success mt-2">
                            <FaPlus /> Create Task
                        </button>
                    </div>
                )}
            </div>

            <div className="tm-filters">
                <div className="filter-group" style={{ position: 'relative' }}>
                    <FaSearch className="filter-icon" />
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks... (/)"
                        className="filter-input"
                    />
                </div>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
                    <option value="all">All Categories</option>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            {selectedIds.size > 0 && (
                <div className="bulk-bar">
                    <span className="bulk-count">{selectedIds.size} selected</span>
                    <button onClick={handleBulkComplete} className="tm-btn tm-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <FaCheck /> Complete
                    </button>
                    <button onClick={handleBulkDelete} className="tm-btn tm-btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <FaTrash /> Delete
                    </button>
                    <button onClick={() => setSelectedIds(new Set())} className="tm-btn tm-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Clear
                    </button>
                </div>
            )}

            <div className="task-list">
                {filteredTasks.length > 0 ? (
                    <>
                        <div className="task-list-header">
                            <button
                                className={`select-all-btn ${selectedIds.size === filteredTasks.length && filteredTasks.length > 0 ? 'active' : ''}`}
                                onClick={handleSelectAll}
                            >
                                <FaCheck size={10} />
                            </button>
                            <span className="task-count">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
                        </div>
                        {filteredTasks.map((item) => (
                            <div
                                key={item._id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item._id)}
                                onDragOver={(e) => handleDragOver(e, item._id)}
                                onDrop={(e) => handleDrop(e, item._id)}
                                onDragEnd={handleDragEnd}
                                className={`task-card ${item.isDone ? 'task-done' : ''} ${isOverdue(item) ? 'task-overdue' : ''} ${isBlocked(item) ? 'task-blocked' : ''} ${selectedIds.has(item._id) ? 'task-selected' : ''} ${draggedId === item._id ? 'task-dragging' : ''} ${dragOverId === item._id ? 'task-drag-over' : ''}`}
                            >
                                <div className="task-card-main">
                                    <div className="task-drag-handle">
                                        <FaGripVertical />
                                    </div>
                                    <button
                                        className={`task-checkbox ${selectedIds.has(item._id) ? 'selected' : ''} ${item.isDone ? 'checked' : ''}`}
                                        onClick={(e) => {
                                            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                                                handleToggleSelect(item._id);
                                            } else {
                                                handleCheckAndUncheck(item);
                                            }
                                        }}
                                    >
                                        {item.isDone && <FaCheck size={10} />}
                                    </button>

                                    <div className="task-info" onClick={() => setSelectedTask(item)}>
                                        <div className="task-name-row">
                                            <span className={`task-name ${item.isDone ? 'done' : ''}`}>
                                                {item.taskName}
                                            </span>
                                            <div className="task-badges">
                                                <span className="badge priority" style={{ background: getPriorityColor(item.priority) }}>
                                                    {item.priority}
                                                </span>
                                                <span className="badge category" style={{ background: getCategoryColor(item.category) }}>
                                                    {item.category}
                                                </span>
                                                {item.dueDate && (
                                                    <span className={`badge due-date ${isOverdue(item) ? 'overdue' : ''}`}>
                                                        {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                                {item.dependencies?.length > 0 && (
                                                    <span className={`badge dep-badge ${isBlocked(item) ? 'blocked' : ''}`}>
                                                        <FaLink size={10} /> {item.dependencies.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {item.subtaskStats && item.subtaskStats.total > 0 && (
                                            <div className="task-subtask-preview">
                                                <div className="mini-progress">
                                                    <div
                                                        className="mini-progress-fill"
                                                        style={{ width: `${(item.subtaskStats.done / item.subtaskStats.total) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="subtask-count">
                                                    {item.subtaskStats.done}/{item.subtaskStats.total} subtasks
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="task-actions">
                                        <button
                                            onClick={() => { setUpdateTask(item); setInput(item.taskName); }}
                                            className="task-action-btn edit"
                                            title="Edit"
                                        >
                                            <FaPencilAlt />
                                        </button>
                                        <button
                                            onClick={() => setSelectedTask(item)}
                                            className="task-action-btn expand"
                                            title="Details"
                                        >
                                            {selectedTask?._id === item._id ? <FaChevronDown /> : <FaChevronRight />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTask(item._id)}
                                            className="task-action-btn delete"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {selectedTask?._id === item._id && (
                                    <div className="task-expanded">
                                        {(item.description || item.dueDate) && (
                                            <div className="task-quick-info">
                                                {item.description && <p className="task-desc">{item.description}</p>}
                                                {item.dueDate && (
                                                    <span className={`due-label ${isOverdue(item) ? 'overdue-text' : ''}`}>
                                                        Due: {new Date(item.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">
                            {searchTerm || filterPriority !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                                ? <FaSearch />
                                : <FaInbox />}
                        </div>
                        <div className="empty-state-text">
                            {searchTerm || filterPriority !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                                ? 'No tasks match your filters'
                                : 'No tasks yet'}
                        </div>
                        {!searchTerm && filterPriority === 'all' && filterCategory === 'all' && filterStatus === 'all' && (
                            <div className="empty-state-sub">
                                <FaRocket /> Create your first task to get started
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    allTasks={copyTasks}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={() => { fetchAllTasks(); setSelectedTask(null); }}
                />
            )}

            {showCmdPalette && (
                <CommandPalette
                    tasks={copyTasks}
                    onAction={handleCmdAction}
                    onClose={() => setShowCmdPalette(false)}
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                />
            )}

            {showFocusMode && (
                <FocusMode
                    tasks={copyTasks}
                    onToggleTask={handleCheckAndUncheck}
                    onSelectTask={setSelectedTask}
                    onClose={() => setShowFocusMode(false)}
                />
            )}

            {showActivityLog && (
                <ActivityLog onClose={() => setShowActivityLog(false)} />
            )}

            {showShortcuts && (
                <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
            )}

            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
}

export default TaskManager;
