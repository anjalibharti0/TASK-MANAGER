import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

function ThemeToggle({ theme, onToggle }) {
    return (
        <button className="theme-toggle" onClick={onToggle} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
        </button>
    );
}

export default ThemeToggle;
