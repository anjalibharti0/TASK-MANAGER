import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaHandshake, FaUser, FaBuilding, FaCalendar, FaDollarSign, FaStickyNote, FaGripVertical, FaArrowRight, FaFilter } from 'react-icons/fa';
import { GetAllDeals, CreateDeal, UpdateDeal, DeleteDeal, GetAllContacts, GetAllCompanies } from '../api';
import { notify } from '../utils';

const FaTrophy = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
);

const STAGES = [
    { key: 'lead', label: 'Lead', color: '#f59e0b', icon: '🎯' },
    { key: 'qualified', label: 'Qualified', color: '#6366f1', icon: '✅' },
    { key: 'proposal', label: 'Proposal', color: '#8b5cf6', icon: '📋' },
    { key: 'negotiation', label: 'Negotiation', color: '#06b6d4', icon: '🤝' },
    { key: 'closed-won', label: 'Closed Won', color: '#10b981', icon: '🏆' },
    { key: 'closed-lost', label: 'Closed Lost', color: '#ef4444', icon: '❌' }
];

function DealPipeline() {
    const [deals, setDeals] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStage, setFilterStage] = useState('');
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [draggedDeal, setDraggedDeal] = useState(null);
    const [dragOverStage, setDragOverStage] = useState(null);
    const [form, setForm] = useState({ title: '', value: '', stage: 'lead', contactId: '', companyId: '', expectedCloseDate: '', notes: '' });

    useEffect(() => { fetchDeals(); fetchDropdowns(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchDeals(), 300);
        return () => clearTimeout(timer);
    }, [search, filterStage]);

    const fetchDeals = async () => {
        const params = {};
        if (search) params.search = search;
        if (filterStage) params.stage = filterStage;
        const res = await GetAllDeals(params);
        if (res?.success) setDeals(res.data);
        setLoading(false);
    };

    const fetchDropdowns = async () => {
        const [cRes, coRes] = await Promise.all([GetAllContacts(), GetAllCompanies()]);
        if (cRes?.success) setContacts(cRes.data);
        if (coRes?.success) setCompanies(coRes.data);
    };

    const resetForm = () => {
        setForm({ title: '', value: '', stage: 'lead', contactId: '', companyId: '', expectedCloseDate: '', notes: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleEdit = (d) => {
        setForm({
            title: d.title,
            value: d.value || '',
            stage: d.stage,
            contactId: d.contactId?._id || '',
            companyId: d.companyId?._id || '',
            expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.split('T')[0] : '',
            notes: d.notes || ''
        });
        setEditing(d);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            ...form,
            value: form.value ? Number(form.value) : 0,
            contactId: form.contactId || null,
            companyId: form.companyId || null,
            expectedCloseDate: form.expectedCloseDate || null
        };

        if (editing) {
            const res = await UpdateDeal(editing._id, body);
            if (res?.success) { notify('Deal updated', 'success'); fetchDeals(); resetForm(); setSelectedDeal(null); }
            else notify(res?.message || 'Failed to update', 'error');
        } else {
            const res = await CreateDeal(body);
            if (res?.success) { notify('Deal created', 'success'); fetchDeals(); resetForm(); }
            else notify(res?.message || 'Failed to create', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this deal?')) return;
        const res = await DeleteDeal(id);
        if (res?.success) { notify('Deal deleted', 'success'); fetchDeals(); setSelectedDeal(null); }
        else notify(res?.message || 'Failed to delete', 'error');
    };

    const handleStageChange = async (dealId, newStage) => {
        const res = await UpdateDeal(dealId, { stage: newStage });
        if (res?.success) fetchDeals();
    };

    const handleDragStart = (e, deal) => {
        setDraggedDeal(deal);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', deal._id);
        setTimeout(() => e.target.classList.add('dragging'), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDraggedDeal(null);
        setDragOverStage(null);
    };

    const handleDragOver = (e, stageKey) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverStage(stageKey);
    };

    const handleDragLeave = () => {
        setDragOverStage(null);
    };

    const handleDrop = async (e, stageKey) => {
        e.preventDefault();
        setDragOverStage(null);
        if (draggedDeal && draggedDeal.stage !== stageKey) {
            await handleStageChange(draggedDeal._id, stageKey);
        }
        setDraggedDeal(null);
    };

    const formatValue = (v) => {
        if (!v) return '$0';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
        return '$' + Number(v).toLocaleString();
    };

    const groupedDeals = STAGES.map(s => ({
        ...s,
        deals: deals.filter(d => d.stage === s.key)
    }));

    const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + (d.value || 0), 0);
    const activeDeals = deals.filter(d => !d.stage.startsWith('closed'));
    const winRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed-won').length / deals.length) * 100) : 0;

    const getDaysUntilClose = (date) => {
        if (!date) return null;
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const formatMoney = (v) => {
        if (!v) return '$0';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
        return '$' + v.toLocaleString();
    };

    return (
        <div className="crm-section">
            <div className="crm-toolbar">
                <div className="crm-search">
                    <FaSearch className="crm-search-icon" />
                    <input type="text" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="crm-search-input" />
                    {search && <button className="crm-search-clear" onClick={() => setSearch('')}><FaTimes /></button>}
                </div>
                <div className="crm-toolbar-filters">
                    <div className="crm-filter-group">
                        <FaFilter className="crm-filter-icon" />
                        <select className="crm-filter-select" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                            <option value="">All Stages</option>
                            {STAGES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                        </select>
                    </div>
                </div>
                <button className="tm-btn tm-btn-primary crm-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                    <FaPlus /> <span className="crm-btn-text">Add Deal</span>
                </button>
            </div>

            <div className="crm-deal-summary">
                <div className="crm-deal-summary-card gradient-total">
                    <div className="crm-deal-summary-icon"><FaDollarSign /></div>
                    <div className="crm-deal-summary-info">
                        <span className="crm-deal-summary-value">{formatMoney(totalValue)}</span>
                        <span className="crm-deal-summary-label">Total Pipeline</span>
                    </div>
                </div>
                <div className="crm-deal-summary-card gradient-won">
                    <div className="crm-deal-summary-icon"><FaHandshake /></div>
                    <div className="crm-deal-summary-info">
                        <span className="crm-deal-summary-value">{formatMoney(wonValue)}</span>
                        <span className="crm-deal-summary-label">Revenue Won</span>
                    </div>
                </div>
                <div className="crm-deal-summary-card gradient-active">
                    <div className="crm-deal-summary-icon"><FaArrowRight /></div>
                    <div className="crm-deal-summary-info">
                        <span className="crm-deal-summary-value">{activeDeals.length}</span>
                        <span className="crm-deal-summary-label">Active Deals</span>
                    </div>
                </div>
                <div className="crm-deal-summary-card gradient-rate">
                    <div className="crm-deal-summary-icon"><FaTrophy /></div>
                    <div className="crm-deal-summary-info">
                        <span className="crm-deal-summary-value">{winRate}%</span>
                        <span className="crm-deal-summary-label">Win Rate</span>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="crm-form-card">
                    <div className="crm-form-header">
                        <div className="crm-form-title-group">
                            <div className="crm-form-icon"><FaHandshake /></div>
                            <div>
                                <h4>{editing ? 'Edit Deal' : 'New Deal'}</h4>
                                <span className="crm-form-subtitle">{editing ? 'Update deal details' : 'Create a new deal in your pipeline'}</span>
                            </div>
                        </div>
                        <button className="crm-close-btn" onClick={resetForm}><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="crm-form">
                        <div className="crm-form-grid">
                            <div className="crm-form-field full-width">
                                <label><FaHandshake className="crm-field-icon" /> Deal Title *</label>
                                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="crm-input" placeholder="Enterprise License Deal" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaDollarSign className="crm-field-icon" /> Value ($)</label>
                                <input type="number" min="0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="crm-input" placeholder="50000" />
                            </div>
                            <div className="crm-form-field">
                                <label>Stage</label>
                                <div className="crm-stage-selector">
                                    {STAGES.map(s => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            className={`crm-stage-option ${form.stage === s.key ? 'active' : ''}`}
                                            style={{ '--stage-color': s.color }}
                                            onClick={() => setForm({...form, stage: s.key})}
                                        >
                                            <span>{s.icon}</span> {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="crm-form-field">
                                <label><FaUser className="crm-field-icon" /> Contact</label>
                                <select value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})} className="crm-input">
                                    <option value="">Select contact...</option>
                                    {contacts.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                                </select>
                            </div>
                            <div className="crm-form-field">
                                <label><FaBuilding className="crm-field-icon" /> Company</label>
                                <select value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})} className="crm-input">
                                    <option value="">Select company...</option>
                                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="crm-form-field">
                                <label><FaCalendar className="crm-field-icon" /> Expected Close Date</label>
                                <input type="date" value={form.expectedCloseDate} onChange={e => setForm({...form, expectedCloseDate: e.target.value})} className="crm-input" />
                            </div>
                            <div className="crm-form-field full-width">
                                <label><FaStickyNote className="crm-field-icon" /> Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="crm-textarea" rows={3} placeholder="Deal notes..." />
                            </div>
                        </div>
                        <div className="crm-form-actions">
                            <button type="button" className="tm-btn tm-btn-secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="tm-btn tm-btn-primary">{editing ? 'Update Deal' : 'Create Deal'}</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="crm-pipeline">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="crm-pipeline-column">
                            <div className="crm-skeleton-line w40" style={{ height: 20, margin: '1rem' }} />
                            <div className="crm-skeleton-card" style={{ height: 120, margin: '0 0.5rem 0.5rem' }} />
                            <div className="crm-skeleton-card" style={{ height: 120, margin: '0 0.5rem 0.5rem' }} />
                        </div>
                    ))}
                </div>
            ) : deals.length === 0 ? (
                <div className="crm-empty-state">
                    <div className="crm-empty-illustration">
                        <div className="crm-empty-circles">
                            <span /><span /><span />
                        </div>
                        <FaHandshake className="crm-empty-icon" />
                    </div>
                    <h3>No deals yet</h3>
                    <p>Create your first deal to start tracking your sales pipeline</p>
                    <button className="tm-btn tm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                        <FaPlus /> Create First Deal
                    </button>
                </div>
            ) : filterStage ? (
                <div className="crm-table-wrap">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Deal</th>
                                <th>Value</th>
                                <th>Stage</th>
                                <th>Contact</th>
                                <th>Company</th>
                                <th>Expected Close</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map((d, i) => (
                                <tr key={d._id} className="crm-table-row" style={{ animationDelay: `${i * 0.03}s` }} onClick={() => setSelectedDeal(d)}>
                                    <td className="fw-bold">{d.title}</td>
                                    <td className="crm-deal-value-cell">{formatValue(d.value)}</td>
                                    <td>
                                        <span className="crm-status-badge" style={{ background: STAGES.find(s => s.key === d.stage)?.color + '22', color: STAGES.find(s => s.key === d.stage)?.color, borderColor: STAGES.find(s => s.key === d.stage)?.color + '44' }}>
                                            {STAGES.find(s => s.key === d.stage)?.icon} {STAGES.find(s => s.key === d.stage)?.label}
                                        </span>
                                    </td>
                                    <td>{d.contactId ? `${d.contactId.firstName} ${d.contactId.lastName}` : '-'}</td>
                                    <td>{d.companyId?.name || '-'}</td>
                                    <td>{d.expectedCloseDate ? new Date(d.expectedCloseDate).toLocaleDateString() : '-'}</td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="crm-actions">
                                            <button className="crm-action-btn edit" onClick={() => handleEdit(d)}><FaEdit /></button>
                                            <button className="crm-action-btn delete" onClick={() => handleDelete(d._id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="crm-pipeline">
                    {groupedDeals.map(stage => (
                        <div
                            key={stage.key}
                            className={`crm-pipeline-column ${dragOverStage === stage.key ? 'drag-over' : ''}`}
                            onDragOver={e => handleDragOver(e, stage.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, stage.key)}
                        >
                            <div className="crm-pipeline-col-header" style={{ borderColor: stage.color }}>
                                <span className="crm-pipeline-col-dot" style={{ background: stage.color }} />
                                <span className="crm-pipeline-col-label">{stage.icon} {stage.label}</span>
                                <span className="crm-pipeline-col-count" style={{ background: stage.color + '22', color: stage.color }}>
                                    {stage.deals.length}
                                </span>
                            </div>
                            <div className="crm-pipeline-col-value">
                                {formatValue(stage.deals.reduce((s, d) => s + (d.value || 0), 0))}
                            </div>
                            <div className="crm-pipeline-cards">
                                {stage.deals.length === 0 ? (
                                    <div className="crm-pipeline-empty">
                                        <span>Drop deals here</span>
                                    </div>
                                ) : stage.deals.map(d => {
                                    const daysLeft = getDaysUntilClose(d.expectedCloseDate);
                                    return (
                                        <div
                                            key={d._id}
                                            className={`crm-deal-card ${draggedDeal?._id === d._id ? 'dragging' : ''}`}
                                            draggable
                                            onDragStart={e => handleDragStart(e, d)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => setSelectedDeal(d)}
                                        >
                                            <div className="crm-deal-card-top">
                                                <div className="crm-deal-grip"><FaGripVertical /></div>
                                                <div className="crm-deal-card-actions" onClick={e => e.stopPropagation()}>
                                                    <button className="crm-action-btn edit sm" onClick={() => handleEdit(d)}><FaEdit /></button>
                                                    <button className="crm-action-btn delete sm" onClick={() => handleDelete(d._id)}><FaTrash /></button>
                                                </div>
                                            </div>
                                            <h4 className="crm-deal-title">{d.title}</h4>
                                            <div className="crm-deal-value">{formatValue(d.value)}</div>
                                            <div className="crm-deal-card-meta">
                                                {d.contactId && (
                                                    <div className="crm-deal-meta-item">
                                                        <FaUser /> {d.contactId.firstName} {d.contactId.lastName}
                                                    </div>
                                                )}
                                                {d.companyId && (
                                                    <div className="crm-deal-meta-item">
                                                        <FaBuilding /> {d.companyId.name}
                                                    </div>
                                                )}
                                            </div>
                                            {d.expectedCloseDate && (
                                                <div className={`crm-deal-date-badge ${daysLeft !== null && daysLeft < 0 ? 'overdue' : daysLeft !== null && daysLeft <= 7 ? 'soon' : ''}`}>
                                                    <FaCalendar />
                                                    {daysLeft !== null && daysLeft < 0
                                                        ? `${Math.abs(daysLeft)}d overdue`
                                                        : daysLeft === 0
                                                        ? 'Closes today'
                                                        : `${daysLeft}d left`
                                                    }
                                                </div>
                                            )}
                                            <div className="crm-deal-quick-stage" onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={d.stage}
                                                    onChange={e => handleStageChange(d._id, e.target.value)}
                                                    className="crm-quick-stage-select"
                                                    style={{ '--stage-color': stage.color }}
                                                >
                                                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDeal && (
                <div className="crm-detail-overlay" onClick={() => setSelectedDeal(null)}>
                    <div className="crm-detail-panel" onClick={e => e.stopPropagation()}>
                        <div className="crm-detail-header" style={{ background: `linear-gradient(135deg, ${STAGES.find(s => s.key === selectedDeal.stage)?.color}, ${STAGES.find(s => s.key === selectedDeal.stage)?.color}88)` }}>
                            <button className="crm-detail-close" onClick={() => setSelectedDeal(null)}><FaTimes /></button>
                            <div className="crm-detail-avatar lg">{STAGES.find(s => s.key === selectedDeal.stage)?.icon}</div>
                            <h3>{selectedDeal.title}</h3>
                            <div className="crm-deal-detail-value">{formatValue(selectedDeal.value)}</div>
                            <div className="crm-status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                                {STAGES.find(s => s.key === selectedDeal.stage)?.label}
                            </div>
                        </div>
                        <div className="crm-detail-body">
                            <div className="crm-detail-section">
                                <h4>Deal Information</h4>
                                <div className="crm-detail-fields">
                                    {selectedDeal.contactId && (
                                        <div className="crm-detail-field">
                                            <FaUser className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Contact</span><span className="crm-detail-field-value">{selectedDeal.contactId.firstName} {selectedDeal.contactId.lastName}</span></div>
                                        </div>
                                    )}
                                    {selectedDeal.companyId && (
                                        <div className="crm-detail-field">
                                            <FaBuilding className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Company</span><span className="crm-detail-field-value">{selectedDeal.companyId.name}</span></div>
                                        </div>
                                    )}
                                    {selectedDeal.expectedCloseDate && (
                                        <div className="crm-detail-field">
                                            <FaCalendar className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Expected Close</span><span className="crm-detail-field-value">{new Date(selectedDeal.expectedCloseDate).toLocaleDateString()}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="crm-detail-section">
                                <h4>Move to Stage</h4>
                                <div className="crm-stage-selector">
                                    {STAGES.map(s => (
                                        <button
                                            key={s.key}
                                            className={`crm-stage-option ${selectedDeal.stage === s.key ? 'active' : ''}`}
                                            style={{ '--stage-color': s.color }}
                                            onClick={async () => {
                                                await handleStageChange(selectedDeal._id, s.key);
                                                setSelectedDeal(prev => ({ ...prev, stage: s.key }));
                                            }}
                                        >
                                            <span>{s.icon}</span> {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {selectedDeal.notes && (
                                <div className="crm-detail-section">
                                    <h4>Notes</h4>
                                    <p className="crm-detail-notes">{selectedDeal.notes}</p>
                                </div>
                            )}
                            <div className="crm-detail-actions">
                                <button className="tm-btn tm-btn-primary" onClick={() => { handleEdit(selectedDeal); setSelectedDeal(null); }}><FaEdit /> Edit Deal</button>
                                <button className="tm-btn tm-btn-danger" onClick={() => handleDelete(selectedDeal._id)}><FaTrash /> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DealPipeline;
