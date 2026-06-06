import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaBuilding, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUsers, FaStickyNote, FaExternalLinkAlt } from 'react-icons/fa';
import { GetAllCompanies, CreateCompany, UpdateCompany, DeleteCompany } from '../api';
import { notify } from '../utils';

const INDUSTRY_COLORS = {
    'Technology': '#6366f1',
    'Finance': '#10b981',
    'Healthcare': '#ef4444',
    'Education': '#f59e0b',
    'Retail': '#ec4899',
    'Manufacturing': '#8b5cf6',
    'Default': '#64748b'
};

function getIndustryColor(industry) {
    if (!industry) return INDUSTRY_COLORS.Default;
    return INDUSTRY_COLORS[industry] || INDUSTRY_COLORS.Default;
}

function CompanyList() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '', email: '', address: '', notes: '' });

    useEffect(() => { fetchCompanies(); }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchCompanies(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCompanies = async () => {
        const params = {};
        if (search) params.search = search;
        const res = await GetAllCompanies(params);
        if (res?.success) setCompanies(res.data);
        setLoading(false);
    };

    const resetForm = () => {
        setForm({ name: '', industry: '', website: '', phone: '', email: '', address: '', notes: '' });
        setEditing(null);
        setShowForm(false);
    };

    const handleEdit = (c) => {
        setForm({ name: c.name, industry: c.industry || '', website: c.website || '', phone: c.phone || '', email: c.email || '', address: c.address || '', notes: c.notes || '' });
        setEditing(c);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editing) {
            const res = await UpdateCompany(editing._id, form);
            if (res?.success) { notify('Company updated', 'success'); fetchCompanies(); resetForm(); setSelectedCompany(null); }
            else notify(res?.message || 'Failed to update', 'error');
        } else {
            const res = await CreateCompany(form);
            if (res?.success) { notify('Company created', 'success'); fetchCompanies(); resetForm(); }
            else notify(res?.message || 'Failed to create', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this company? Contacts will be unlinked.')) return;
        const res = await DeleteCompany(id);
        if (res?.success) { notify('Company deleted', 'success'); fetchCompanies(); setSelectedCompany(null); }
        else notify(res?.message || 'Failed to delete', 'error');
    };

    const getCompanyInitials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="crm-section">
            <div className="crm-toolbar">
                <div className="crm-search">
                    <FaSearch className="crm-search-icon" />
                    <input type="text" placeholder="Search companies by name or industry..." value={search} onChange={e => setSearch(e.target.value)} className="crm-search-input" />
                    {search && (
                        <button className="crm-search-clear" onClick={() => setSearch('')}><FaTimes /></button>
                    )}
                </div>
                <button className="tm-btn tm-btn-primary crm-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
                    <FaPlus /> <span className="crm-btn-text">Add Company</span>
                </button>
            </div>

            {showForm && (
                <div className="crm-form-card">
                    <div className="crm-form-header">
                        <div className="crm-form-title-group">
                            <div className="crm-form-icon"><FaBuilding /></div>
                            <div>
                                <h4>{editing ? 'Edit Company' : 'New Company'}</h4>
                                <span className="crm-form-subtitle">{editing ? 'Update company information' : 'Add a new company to your CRM'}</span>
                            </div>
                        </div>
                        <button className="crm-close-btn" onClick={resetForm}><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="crm-form">
                        <div className="crm-form-grid">
                            <div className="crm-form-field full-width">
                                <label><FaBuilding className="crm-field-icon" /> Company Name *</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="crm-input" placeholder="Acme Corp" />
                            </div>
                            <div className="crm-form-field">
                                <label>Industry</label>
                                <input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="crm-input" placeholder="Technology" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaGlobe className="crm-field-icon" /> Website</label>
                                <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="crm-input" placeholder="https://acme.com" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaEnvelope className="crm-field-icon" /> Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="crm-input" placeholder="info@acme.com" />
                            </div>
                            <div className="crm-form-field">
                                <label><FaPhone className="crm-field-icon" /> Phone</label>
                                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="crm-input" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="crm-form-field full-width">
                                <label><FaMapMarkerAlt className="crm-field-icon" /> Address</label>
                                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="crm-input" placeholder="123 Main St, City, State" />
                            </div>
                            <div className="crm-form-field full-width">
                                <label><FaStickyNote className="crm-field-icon" /> Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="crm-textarea" rows={3} placeholder="Add any notes about this company..." />
                            </div>
                        </div>
                        <div className="crm-form-actions">
                            <button type="button" className="tm-btn tm-btn-secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="tm-btn tm-btn-primary">{editing ? 'Update Company' : 'Create Company'}</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="crm-skeleton-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="crm-skeleton-card crm-skeleton-company">
                            <div className="crm-skeleton-avatar lg" />
                            <div className="crm-skeleton-lines">
                                <div className="crm-skeleton-line w60" />
                                <div className="crm-skeleton-line w40" />
                                <div className="crm-skeleton-line w80" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : companies.length === 0 ? (
                <div className="crm-empty-state">
                    <div className="crm-empty-illustration">
                        <div className="crm-empty-circles">
                            <span /><span /><span />
                        </div>
                        <FaBuilding className="crm-empty-icon" />
                    </div>
                    <h3>No companies yet</h3>
                    <p>Add companies to organize your contacts and track deals</p>
                    <button className="tm-btn tm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
                        <FaPlus /> Add First Company
                    </button>
                </div>
            ) : (
                <div className="crm-company-grid">
                    {companies.map((c, i) => (
                        <div
                            key={c._id}
                            className="crm-company-card-advanced"
                            style={{ animationDelay: `${i * 0.05}s` }}
                            onClick={() => setSelectedCompany(c)}
                        >
                            <div className="crm-company-card-accent" style={{ background: `linear-gradient(135deg, ${getIndustryColor(c.industry)}, ${getIndustryColor(c.industry)}88)` }} />
                            <div className="crm-company-card-content">
                                <div className="crm-company-card-top">
                                    <div className="crm-company-logo" style={{ background: getIndustryColor(c.industry) + '22', color: getIndustryColor(c.industry) }}>
                                        {getCompanyInitials(c.name)}
                                    </div>
                                    <div className="crm-company-card-actions" onClick={e => e.stopPropagation()}>
                                        <button className="crm-action-btn edit" onClick={() => handleEdit(c)} title="Edit"><FaEdit /></button>
                                        <button className="crm-action-btn delete" onClick={() => handleDelete(c._id)} title="Delete"><FaTrash /></button>
                                    </div>
                                </div>
                                <h4 className="crm-company-name">{c.name}</h4>
                                {c.industry && (
                                    <span className="crm-industry-badge" style={{ background: getIndustryColor(c.industry) + '22', color: getIndustryColor(c.industry), borderColor: getIndustryColor(c.industry) + '44' }}>
                                        {c.industry}
                                    </span>
                                )}
                                <div className="crm-company-stats">
                                    <div className="crm-company-stat">
                                        <FaUsers className="crm-company-stat-icon" />
                                        <span>{c.contactCount || 0} contacts</span>
                                    </div>
                                </div>
                                <div className="crm-company-contact-info">
                                    {c.email && <span><FaEnvelope /> {c.email}</span>}
                                    {c.phone && <span><FaPhone /> {c.phone}</span>}
                                    {c.website && <span><FaGlobe /> {c.website}</span>}
                                    {c.address && <span><FaMapMarkerAlt /> {c.address}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedCompany && (
                <div className="crm-detail-overlay" onClick={() => setSelectedCompany(null)}>
                    <div className="crm-detail-panel" onClick={e => e.stopPropagation()}>
                        <div className="crm-detail-header" style={{ background: `linear-gradient(135deg, ${getIndustryColor(selectedCompany.industry)}, ${getIndustryColor(selectedCompany.industry)}88)` }}>
                            <button className="crm-detail-close" onClick={() => setSelectedCompany(null)}><FaTimes /></button>
                            <div className="crm-detail-avatar lg">{getCompanyInitials(selectedCompany.name)}</div>
                            <h3>{selectedCompany.name}</h3>
                            {selectedCompany.industry && <span>{selectedCompany.industry}</span>}
                        </div>
                        <div className="crm-detail-body">
                            <div className="crm-detail-section">
                                <h4>Company Information</h4>
                                <div className="crm-detail-fields">
                                    {selectedCompany.email && (
                                        <div className="crm-detail-field">
                                            <FaEnvelope className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Email</span><span className="crm-detail-field-value">{selectedCompany.email}</span></div>
                                        </div>
                                    )}
                                    {selectedCompany.phone && (
                                        <div className="crm-detail-field">
                                            <FaPhone className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Phone</span><span className="crm-detail-field-value">{selectedCompany.phone}</span></div>
                                        </div>
                                    )}
                                    {selectedCompany.website && (
                                        <div className="crm-detail-field">
                                            <FaGlobe className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Website</span><span className="crm-detail-field-value"><a href={selectedCompany.website} target="_blank" rel="noopener noreferrer">{selectedCompany.website} <FaExternalLinkAlt /></a></span></div>
                                        </div>
                                    )}
                                    {selectedCompany.address && (
                                        <div className="crm-detail-field">
                                            <FaMapMarkerAlt className="crm-detail-field-icon" />
                                            <div><span className="crm-detail-field-label">Address</span><span className="crm-detail-field-value">{selectedCompany.address}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {selectedCompany.notes && (
                                <div className="crm-detail-section">
                                    <h4>Notes</h4>
                                    <p className="crm-detail-notes">{selectedCompany.notes}</p>
                                </div>
                            )}
                            <div className="crm-detail-section">
                                <div className="crm-company-stat-lg">
                                    <FaUsers />
                                    <span>{selectedCompany.contactCount || 0} associated contacts</span>
                                </div>
                            </div>
                            <div className="crm-detail-actions">
                                <button className="tm-btn tm-btn-primary" onClick={() => { handleEdit(selectedCompany); setSelectedCompany(null); }}><FaEdit /> Edit Company</button>
                                <button className="tm-btn tm-btn-danger" onClick={() => handleDelete(selectedCompany._id)}><FaTrash /> Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CompanyList;
