import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaListUl, FaTasks, FaCheckDouble } from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import StatsCard from '../components/StatsCard';
import { GetTaskStats } from '../api';
import { notify } from '../utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const res = await GetTaskStats();
        if (res && res.success) {
            setStats(res.data);
        } else {
            notify('Failed to load stats', 'error');
        }
    };

    if (!stats) {
        return (
            <div className="dashboard-page">
                <h2 className="dashboard-title">Dashboard</h2>
                <div className="stats-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="skeleton skeleton-stat" />
                    ))}
                </div>
                <div className="charts-grid">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton skeleton-chart" />
                    ))}
                </div>
            </div>
        );
    }

    const completionRate = stats.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    const priorityData = [
        { name: 'High', value: stats.highPriority, color: '#ef4444' },
        { name: 'Medium', value: stats.mediumPriority, color: '#f59e0b' },
        { name: 'Low', value: stats.lowPriority, color: '#10b981' }
    ].filter(d => d.value > 0);

    const categoryData = stats.categoryStats.map((c, i) => ({
        name: c._id,
        value: c.count,
        color: COLORS[i % COLORS.length]
    }));

    const weeklyData = (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const label = d.toLocaleDateString('en-US', { weekday: 'short' });
            const found = stats.completedPerDay.find(day => day._id === key);
            days.push({ name: label, count: found ? found.count : 0 });
        }
        return days;
    })();

    return (
        <div className="dashboard-page">
            <h2 className="dashboard-title">Dashboard</h2>

            <div className="stats-grid">
                <StatsCard icon={<FaTasks />} value={stats.totalTasks} label="Total Tasks" color="#6366f1" />
                <StatsCard icon={<FaCheckCircle />} value={stats.completedTasks} label="Completed" color="#10b981" />
                <StatsCard icon={<FaClock />} value={stats.pendingTasks} label="Pending" color="#f59e0b" />
                <StatsCard icon={<FaExclamationTriangle />} value={stats.overdueTasks} label="Overdue" color="#ef4444" />
                <StatsCard icon={<FaCheckDouble />} value={`${stats.subtaskStats.done}/${stats.subtaskStats.total}`} label="Subtasks Done" color="#8b5cf6" />
                <StatsCard icon={<FaListUl />} value={`${completionRate}%`} label="Completion Rate" color="#ec4899" />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h4>Tasks Completed (Last 7 Days)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    background: '#1e293b',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#f8fafc'
                                }}
                            />
                            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h4>Priority Distribution</h4>
                    {priorityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ height: 250 }}>
                            <div className="empty-state-icon"><FaCheckCircle /></div>
                            <div className="empty-state-text">No pending tasks</div>
                        </div>
                    )}
                </div>

                <div className="chart-card">
                    <h4>Category Breakdown</h4>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc'
                                    }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ height: 250 }}>
                            <div className="empty-state-icon"><FaListUl /></div>
                            <div className="empty-state-text">No tasks yet</div>
                        </div>
                    )}
                </div>

                <div className="chart-card">
                    <h4>Completion Ring</h4>
                    <div className="completion-ring-container">
                        <svg viewBox="0 0 120 120" className="completion-ring">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="50"
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                        </svg>
                        <div className="completion-ring-text">
                            <span className="completion-rate">{completionRate}%</span>
                            <span className="completion-label">Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
