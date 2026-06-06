import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { FaTasks, FaChartBar, FaUsers } from 'react-icons/fa';
import './App.css';
import TaskManager from './TaskManager';
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { PrivateRoute, PublicRoute } from './components/ReRoute';
import ThemeToggle from './components/ThemeToggle';

function NavBar({ theme, onToggleTheme }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-brand">Task Manager</div>
      <div className="nav-links">
        <Link to="/" className={isActive('/')}><FaTasks className="me-1" /> Tasks</Link>
        <Link to="/dashboard" className={isActive('/dashboard')}><FaChartBar className="me-1" /> Dashboard</Link>
        <Link to="/crm" className={isActive('/crm')}><FaUsers className="me-1" /> CRM</Link>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </nav>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className="App" data-theme={theme}>
      <BrowserRouter>
        <PrivateRoute>
          <NavBar theme={theme} onToggleTheme={toggleTheme} />
        </PrivateRoute>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <TaskManager theme={theme} onToggleTheme={toggleTheme} />
            </PrivateRoute>
          } />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/crm" element={
            <PrivateRoute>
              <CRM />
            </PrivateRoute>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
