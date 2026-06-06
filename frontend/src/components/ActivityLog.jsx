import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaCheck, FaPlus, FaTrash, FaEdit, FaLink } from 'react-icons/fa';

const ICONS = {
    created: <FaPlus />,
    completed: <FaCheck />,
    uncompleted: <FaEdit />,
    deleted: <FaTrash />,
    updated: <FaEdit />,
    dependency: <FaLink />,
};

const COLORS = {
    created: '#10b981',
    completed: '#6366f1',
    uncompleted: '#f59e0b',
    deleted: '#ef4444',
    updated: '#8b5cf6',
    dependency: '#ec4899',
};

function ActivityLog({ onClose }) {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('taskActivityLog') || '[]');
        setLogs(stored.slice(0, 50));
    }, []);

    const clearLogs = () => {
        localStorage.removeItem('taskActivityLog');
        setLogs([]);
    };

    return (
        <div className="cmd-overlay" onClick={onClose}>
            <div className="activity-panel" onClick={e => e.stopPropagation()}>
                <div className="activity-header">
                    <FaHistory size={18} />
                    <h3>Activity Log</h3>
                    {logs.length > 0 && (
                        <button className="activity-clear" onClick={clearLogs}>Clear All</button>
                    )}
                    <button className="shortcuts-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="activity-list">
                    {logs.length === 0 ? (
                        <div className="activity-empty">No activity recorded yet</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon" style={{ color: COLORS[log.type] || '#94a3b8' }}>
                                    {ICONS[log.type] || <FaHistory />}
                                </div>
                                <div className="activity-text">
                                    <span className="activity-action">{log.message}</span>
                                    <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export const logActivity = (type, message) => {
    const logs = JSON.parse(localStorage.getItem('taskActivityLog') || '[]');
    logs.unshift({ type, message, timestamp: new Date().toISOString() });
    localStorage.setItem('taskActivityLog', JSON.stringify(logs.slice(0, 100)));
};

export default ActivityLog;
