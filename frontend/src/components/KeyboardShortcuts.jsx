import React from 'react';
import { FaTimes, FaKeyboard } from 'react-icons/fa';

const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Open Command Palette' },
    { keys: ['N'], desc: 'New Task' },
    { keys: ['F'], desc: 'Toggle Focus Mode' },
    { keys: ['T'], desc: 'Toggle Theme' },
    { keys: ['D'], desc: 'Go to Dashboard' },
    { keys: ['Esc'], desc: 'Close modal / palette' },
    { keys: ['/'], desc: 'Focus search' },
    { keys: ['1-4'], desc: 'Switch filter preset' },
    { keys: ['?'], desc: 'Show shortcuts' },
];

function KeyboardShortcuts({ onClose }) {
    return (
        <div className="cmd-overlay" onClick={onClose}>
            <div className="shortcuts-panel" onClick={e => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <FaKeyboard size={18} />
                    <h3>Keyboard Shortcuts</h3>
                    <button className="shortcuts-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="shortcuts-list">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="shortcut-row">
                            <span className="shortcut-desc">{s.desc}</span>
                            <div className="shortcut-keys">
                                {s.keys.map((k, j) => (
                                    <kbd key={j}>{k}</kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default KeyboardShortcuts;
