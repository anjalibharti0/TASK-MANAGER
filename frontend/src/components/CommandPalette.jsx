import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaChartBar, FaSignOutAlt, FaMoon, FaSun, FaKeyboard, FaBullseye, FaCheck, FaPencilAlt, FaTrash } from 'react-icons/fa';

function CommandPalette({ tasks, onAction, onClose, theme, onToggleTheme }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const actions = [
        { id: 'new-task', icon: <FaPlus />, label: 'New Task', group: 'Actions', shortcut: 'N' },
        { id: 'toggle-theme', icon: theme === 'dark' ? <FaSun /> : <FaMoon />, label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, group: 'Actions', shortcut: 'T' },
        { id: 'dashboard', icon: <FaChartBar />, label: 'Go to Dashboard', group: 'Navigation', shortcut: 'D' },
        { id: 'focus-mode', icon: <FaBullseye />, label: 'Toggle Focus Mode', group: 'Actions', shortcut: 'F' },
        { id: 'shortcuts', icon: <FaKeyboard />, label: 'Keyboard Shortcuts', group: 'Help', shortcut: '?' },
        { id: 'logout', icon: <FaSignOutAlt />, label: 'Logout', group: 'Actions' },
    ];

    const taskActions = tasks.slice(0, 8).map(t => ({
        id: `task-${t._id}`,
        icon: t.isDone ? <FaCheck size={10} /> : <FaPencilAlt size={10} />,
        label: t.taskName,
        sub: `${t.priority} · ${t.category}`,
        group: 'Tasks',
        taskId: t._id,
    }));

    const allItems = [...actions, ...taskActions];
    const filtered = query
        ? allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
        : allItems;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const el = listRef.current?.children[selectedIndex];
        if (el) el.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            handleSelect(filtered[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item) => {
        if (item.id.startsWith('task-')) {
            onAction('open-task', item.taskId);
        } else {
            onAction(item.id);
        }
        onClose();
    };

    const groups = {};
    filtered.forEach(item => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
    });

    let flatIndex = -1;

    return (
        <div className="cmd-overlay" onClick={onClose}>
            <div className="cmd-palette" onClick={e => e.stopPropagation()}>
                <div className="cmd-search">
                    <FaSearch className="cmd-search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command or search..."
                        className="cmd-input"
                    />
                    <kbd className="cmd-esc">ESC</kbd>
                </div>
                <div className="cmd-list" ref={listRef}>
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group}>
                            <div className="cmd-group-label">{group}</div>
                            {items.map((item) => {
                                flatIndex++;
                                const idx = flatIndex;
                                return (
                                    <div
                                        key={item.id}
                                        className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <span className="cmd-item-icon">{item.icon}</span>
                                        <div className="cmd-item-text">
                                            <span className="cmd-item-label">{item.label}</span>
                                            {item.sub && <span className="cmd-item-sub">{item.sub}</span>}
                                        </div>
                                        {item.shortcut && <kbd className="cmd-shortcut">{item.shortcut}</kbd>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="cmd-empty">No results found</div>
                    )}
                </div>
                <div className="cmd-footer">
                    <span><kbd>↑↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Select</span>
                    <span><kbd>esc</kbd> Close</span>
                </div>
            </div>
        </div>
    );
}

export default CommandPalette;
