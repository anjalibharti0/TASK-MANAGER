import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaUser, FaThLarge, FaListUl, FaEnvelope, FaPhone, FaBuilding, FaTag, FaStickyNote, FaChevronRight, FaCheck, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { GetAllContacts, CreateContact, UpdateContact, DeleteContact, GetAllCompanies } from '../api';
import { notify } from '../utils';

const STATUS_OPTIONS = ['lead', 'prospect', 'customer', 'inactive'];
const STATUS_COLORS = { lead: '#f59e0b', prospect: '#6366f1', customer: '#10b981', inactive: '#64748b' };
const STATUS_ICONS = { lead: '🎯', prospect: '📋', customer: '✅', inactive: '⏸️' };

function ContactList() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [selectedContact, setSelectedContact] = useState(null);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', companyId: '', position: '', status: 'lead', tags: '', notes: '' });

    useEffect(() => { fetchContacts(); fetchCompanies(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchContacts(), 300);
        return () => clearTimeout(timer);
    }, [search, filterStatus]);

    const fetchContacts = async () => {
        const params = {};
        if (search) params.search = search;
        if (filterStatus) params.status = filterStatus;
        const res = await GetAllContacts(params);
        if (res?.success) setContacts(res.data);
        setLoading(false);
    };

    const fetchCompanies = async () => {
        const res = await GetAllCompanies();
        if (res?.success) setCompanies(res.data);
    };

    const resetForm = () => {
        setForm({ firstName: '', lastName: '', email: '', phone: '', companyId: '', position: '', status: 'lead', tags: '', notes: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleEdit = (c) => {
        setForm({
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email || '',
            phone: c.phone || '',
            companyId: c.companyId?._id || '',
            position: c.position || '',
            status: c.status,
            tags: (c.tags || []).join(', '),
            notes: c.notes || ''
        });
        setEditing(c);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            ...form,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            companyId: form.companyId || null
        };

        if (editing) {
            const res = await UpdateContact(editing._id, body);
            if (res?.success) {
                notify('Contact updated', 'success');
                fetchContacts();
                resetForm();
                if (selectedContact?._id === editing._id) setSelectedContact(null);
            } else {
                notify(res?.message || 'Failed to update', 'error');
            }
        } else {
            const res = await CreateContact(body);
            if (res?.success) {
                notify('Contact created', 'success');
                fetchContacts();
                resetForm();
            } else {
                notify(res?.message || 'Failed to create', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this contact?')) return;
        const res = await DeleteContact(id);
        if (res?.success) {
            notify('Contact deleted', 'success');
            fetchContacts();
            if (selectedContact?._id === id) setSelectedContact(null);
        } else {
            notify(res?.message || 'Failed to delete', 'error');
        }
    };

    const handleQuickStatus = async (id, newStatus) => {
        const res = await UpdateContact(id, { status: newStatus });
        if (res?.success) {
            fetchContacts();
            if (selectedContact?._id === id) {
                setSelectedContact(prev => ({ ...prev, status: newStatus }));
            }
        }
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sortedContacts = [...contacts].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const getInitials = (c) => `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`;

    const getAvatarGradient = (status) => {
        const gradients = {
            lead: 'linear-gradient(135deg, #f59e0b, #f97316)',
            prospect: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            customer: 'linear-gradient(135deg, #10b981, #06b6d4)',
            inactive: 'linear-gradient(135deg, #64748b, #475569)'
        };
        return gradients[status] || gradients.lead;
    };

    return (
        <div className="crm-section">
            <div className="crm-toolbar">
                <div className="crm-search">
                    <FaSearch className="crm-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="crm-search-input"
                    />
                    {search && (
                        <button className="crm-search-clear" onClick={() => setSearch('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className="crm-toolbar-filters">
                    <div className="crm-filter-group">
                        <FaFilter className="crm-filter-icon" />
                        <select
                            className="crm-filter-select"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{STATUS_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="crm-view-toggle">
                        <button
                            className={`crm-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Table view"
                        >
                            <FaListUl />
                        </button>
                        <button
                            className={`crm-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid view"
                        >
                            <FaThLarge />
                        </button>
                    </div>
                </div>

                <button className="tm-btn tm-btn-primary crm-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                    <FaPlus /> <span className="crm-btn-text">Add Contact</span>
                </button>
            </div>

            {showForm && (
                <div className="crm-form-card">
                    <div className="crm-form-header">
                        <div className="crm-form-title-group">
                            <div className="crm-form-icon">
                                {editing ? <FaEdit /> : <FaPlus />}
                            </div>
                            <div>
                                <h4>{editing ? 'Edit Contact' : 'New Contact'}</h4>
                                <span className="crm-form-subtitle">{editing ? 'Update contact information' : 'Add a new contact to your CRM'}</span>
                            </div>
                        </div>
                        <button className="crm-close-btn" onClick={resetForm}><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="crm-form">
                        <div className="crm-form-grid">
                            <div className="crm-form-field">
                                <label><FaUser className="crm-field-icon" /> First Name *</label>
                                <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="crm-input" placeholder="John" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaUser className="crm-field-icon" /> Last Name *</label>
                                <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="crm-input" placeholder="Doe" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaEnvelope className="crm-field-icon" /> Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="crm-input" placeholder="john@example.com" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaPhone className="crm-field-icon" /> Phone</label>
                                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="crm-input" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaBuilding className="crm-field-icon" /> Company</label>
                                <select value={form.companyId} onChange={e => setForm({...form, companyId: e.target.value})} className="crm-input">
                                    <option value="">Select company...</option>
                                    {companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="crm-form-field">
                                <label>Position</label>
                                <input value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="crm-input" placeholder="Software Engineer" />
                            </div>
                            <div className="crm-form-field">
                                <label>Status</label>
                                <div className="crm-status-selector">
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            className={`crm-status-option ${form.status === s ? 'active' : ''}`}
                                            style={{ '--status-color': STATUS_COLORS[s] }}
                                            onClick={() => setForm({...form, status: s})}
                                        >
                                            <span className="crm-status-dot" />
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="crm-form-field">
                                <label><FaTag className="crm-field-icon" /> Tags</label>
                                <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="crm-input" placeholder="vip, enterprise, saas" />
                                <span className="crm-field-hint">Comma separated</span>
                            </div>
                            <div className="crm-form-field full-width">
                                <label><FaStickyNote className="crm-field-icon" /> Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="crm-textarea" rows={3} placeholder="Add any notes about this contact..." />
                            </div>
                        </div>
                        <div className="crm-form-actions">
                            <button type="button" className="tm-btn tm-btn-secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="tm-btn tm-btn-primary">
                                {editing ? 'Update Contact' : 'Create Contact'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="crm-skeleton-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="crm-skeleton-card">
                            <div className="crm-skeleton-avatar" />
                            <div className="crm-skeleton-lines">
                                <div className="crm-skeleton-line w60" />
                                <div className="crm-skeleton-line w40" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="crm-empty-state">
                    <div className="crm-empty-illustration">
                        <div className="crm-empty-circles">
                            <span /><span /><span />
                        </div>
                        <FaUser className="crm-empty-icon" />
                    </div>
                    <h3>No contacts yet</h3>
                    <p>Start building your network by adding your first contact</p>
                    <button className="tm-btn tm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                        <FaPlus /> Add First Contact
                    </button>
                </div>
            ) : viewMode === 'table' ? (
                <div className="crm-table-wrap">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('firstName')} className="crm-sortable">
                                    Name {sortField === 'firstName' && (sortDir === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                                </th>
                                <th onClick={() => toggleSort('email')} className="crm-sortable">
                                    Email {sortField === 'email' && (sortDir === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                                </th>
                                <th>Phone</th>
                                <th>Company</th>
                                <th onClick={() => toggleSort('status')} className="crm-sortable">
                                    Status {sortField === 'status' && (sortDir === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />)}
                                </th>
                                <th>Tags</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedContacts.map((c, i) => (
                                <tr
                                    key={c._id}
                                    className={`crm-table-row ${selectedContact?._id === c._id ? 'selected' : ''}`}
                                    style={{ animationDelay: `${i * 0.03}s` }}
                                    onClick={() => setSelectedContact(c)}
                                >
                                    <td>
                                        <div className="crm-name-cell">
                                            <div className="crm-avatar" style={{ background: getAvatarGradient(c.status) }}>
                                                {getInitials(c)}
                                            </div>
                                            <div className="crm-name-info">
                                                <span className="crm-name">{c.firstName} {c.lastName}</span>
                                                {c.position && <span className="crm-name-sub">{c.position}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="crm-email-cell">
                                        {c.email ? <><FaEnvelope className="crm-cell-icon" /> {c.email}</> : <span className="crm-no-data">-</span>}
                                    </td>
                                    <td>{c.phone || <span className="crm-no-data">-</span>}</td>
                                    <td>{c.companyId?.name || <span className="crm-no-data">-</span>}</td>
                                    <td>
                                        <div className="crm-status-dropdown-wrap" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={c.status}
                                                onChange={e => handleQuickStatus(c._id, e.target.value)}
                                                className="crm-status-dropdown"
                                                style={{ '--status-color': STATUS_COLORS[c.status] }}
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s}>{STATUS_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="crm-tags">
                                            {(c.tags || []).slice(0, 2).map((t, i) => <span key={i} className="crm-tag">{t}</span>)}
                                            {(c.tags || []).length > 2 && <span className="crm-tag crm-tag-more">+{c.tags.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="crm-actions">
                                            <button className="crm-action-btn edit" onClick={() => handleEdit(c)} title="Edit"><FaEdit /></button>
                                            <button className="crm-action-btn delete" onClick={() => handleDelete(c._id)} title="Delete"><FaTrash /></button>
                                            <button className="crm-action-btn expand" onClick={() => setSelectedContact(c)} title="View details"><FaChevronRight /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="crm-contact-grid">
                    {sortedContacts.map((c, i) => (
                        <div
                            key={c._id}
                            className={`crm-contact-card ${selectedContact?._id === c._id ? 'selected' : ''}`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() => setSelectedContact(c)}
                        >
                            <div className="crm-contact-card-top" style={{ background: getAvatarGradient(c.status) }}>
                                <div className="crm-contact-card-avatar">{getInitials(c)}</div>
                            </div>
                            <div className="crm-contact-card-body">
                                <h4>{c.firstName} {c.lastName}</h4>
                                {c.position && <span className="crm-contact-card-position">{c.position}</span>}
                                <div className="crm-status-badge" style={{ background: STATUS_COLORS[c.status] + '22', color: STATUS_COLORS[c.status], borderColor: STATUS_COLORS[c.status] + '44' }}>
                                    {STATUS_ICONS[c.status]} {c.status}
                                </div>
                                <div className="crm-contact-card-details">
                                    {c.email && <span><FaEnvelope /> {c.email}</span>}
                                    {c.phone && <span><FaPhone /> {c.phone}</span>}
                                    {c.companyId?.name && <span><FaBuilding /> {c.companyId.name}</span>}
                                </div>
                                {(c.tags || []).length > 0 && (
                                    <div className="crm-tags" style={{ marginTop: '0.5rem' }}>
                                        {c.tags.slice(0, 3).map((t, i) => <span key={i} className="crm-tag">{t}</span>)}
                                    </div>
                                )}
                            </div>
                            <div className="crm-contact-card-actions" onClick={e => e.stopPropagation()}>
                                <button className="crm-action-btn edit" onClick={() => handleEdit(c)}><FaEdit /></button>
                                <button className="crm-action-btn delete" onClick={() => handleDelete(c._id)}><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedContact && (
                <div className="crm-detail-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="crm-detail-panel" onClick={e => e.stopPropagation()}>
                        <div className="crm-detail-header" style={{ background: getAvatarGradient(selectedContact.status) }}>
                            <button className="crm-detail-close" onClick={() => setSelectedContact(null)}><FaTimes /></button>
                            <div className="crm-detail-avatar">{getInitials(selectedContact)}</div>
                            <h3>{selectedContact.firstName} {selectedContact.lastName}</h3>
                            {selectedContact.position && <span>{selectedContact.position}</span>}
                            <div className="crm-detail-status">
                                <span className="crm-status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                                    {STATUS_ICONS[selectedContact.status]} {selectedContact.status}
                                </span>
                            </div>
                        </div>
                        <div className="crm-detail-body">
                            <div className="crm-detail-section">
                                <h4>Contact Information</h4>
                                <div className="crm-detail-fields">
                                    {selectedContact.email && (
                                        <div className="crm-detail-field">
                                            <FaEnvelope className="crm-detail-field-icon" />
                                            <div>
                                                <span className="crm-detail-field-label">Email</span>
                                                <span className="crm-detail-field-value">{selectedContact.email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.phone && (
                                        <div className="crm-detail-field">
                                            <FaPhone className="crm-detail-field-icon" />
                                            <div>
                                                <span className="crm-detail-field-label">Phone</span>
                                                <span className="crm-detail-field-value">{selectedContact.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {selectedContact.companyId?.name && (
                                        <div className="crm-detail-field">
                                            <FaBuilding className="crm-detail-field-icon" />
                                            <div>
                                                <span className="crm-detail-field-label">Company</span>
                                                <span className="crm-detail-field-value">{selectedContact.companyId.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {(selectedContact.tags || []).length > 0 && (
                                <div className="crm-detail-section">
                                    <h4>Tags</h4>
                                    <div className="crm-tags">
                                        {selectedContact.tags.map((t, i) => <span key={i} className="crm-tag">{t}</span>)}
                                    </div>
                                </div>
                            )}
                            {selectedContact.notes && (
                                <div className="crm-detail-section">
                                    <h4>Notes</h4>
                                    <p className="crm-detail-notes">{selectedContact.notes}</p>
                                </div>
                            )}
                            <div className="crm-detail-section">
                                <h4>Quick Status</h4>
                                <div className="crm-status-selector">
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s}
                                            className={`crm-status-option ${selectedContact.status === s ? 'active' : ''}`}
                                            style={{ '--status-color': STATUS_COLORS[s] }}
                                            onClick={() => handleQuickStatus(selectedContact._id, s)}
                                        >
                                            <span className="crm-status-dot" />
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="crm-detail-actions">
                                <button className="tm-btn tm-btn-primary" onClick={() => { handleEdit(selectedContact); setSelectedContact(null); }}>
                                    <FaEdit /> Edit Contact
                                </button>
                                <button className="tm-btn tm-btn-danger" onClick={() => { handleDelete(selectedContact._id); }}>
                                    <FaTrash /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactList;
