import React, { useState, useEffect } from 'react';
import { FaUsers, FaBuilding, FaHandshake, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import ContactList from '../components/ContactList';
import CompanyList from '../components/CompanyList';
import DealPipeline from '../components/DealPipeline';
import { GetContactStats, GetDealStats, GetAllCompanies } from '../api';

const TABS = [
    { key: 'contacts', label: 'Contacts', icon: <FaUsers /> },
    { key: 'companies', label: 'Companies', icon: <FaBuilding /> },
    { key: 'deals', label: 'Deals', icon: <FaHandshake /> }
];

function CRM() {
    const [activeTab, setActiveTab] = useState('contacts');
    const [summary, setSummary] = useState(null);

    useEffect(() => { fetchSummary(); }, []);

    const fetchSummary = async () => {
        const [contactRes, dealRes, companyRes] = await Promise.all([
            GetContactStats(),
            GetDealStats(),
            GetAllCompanies()
        ]);
        setSummary({
            contacts: contactRes?.success ? contactRes.data : null,
            deals: dealRes?.success ? dealRes.data : null,
            companies: companyRes?.success ? companyRes.data?.length || 0 : 0
        });
    };

    const formatMoney = (v) => {
        if (!v) return '$0';
        if (v >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
        if (v >= 1000) return '$' + (v / 1000).toFixed(1) + 'K';
        return '$' + v.toLocaleString();
    };

    return (
        <div className="crm-page">
            <div className="crm-header">
                <div className="crm-header-left">
                    <h2 className="crm-title">CRM</h2>
                    <p className="crm-subtitle">Manage your relationships and deals</p>
                </div>
            </div>

            {summary && (
                <div className="crm-summary-bar">
                    <div className="crm-summary-card">
                        <div className="crm-summary-icon contacts"><FaUsers /></div>
                        <div className="crm-summary-info">
                            <span className="crm-summary-value">{summary.contacts?.total || 0}</span>
                            <span className="crm-summary-label">Total Contacts</span>
                        </div>
                        <div className="crm-summary-trend up">
                            <FaArrowUp /> {summary.contacts?.customers || 0} customers
                        </div>
                    </div>
                    <div className="crm-summary-card">
                        <div className="crm-summary-icon companies"><FaBuilding /></div>
                        <div className="crm-summary-info">
                            <span className="crm-summary-value">{summary.companies}</span>
                            <span className="crm-summary-label">Companies</span>
                        </div>
                    </div>
                    <div className="crm-summary-card">
                        <div className="crm-summary-icon deals"><FaHandshake /></div>
                        <div className="crm-summary-info">
                            <span className="crm-summary-value">{summary.deals?.total || 0}</span>
                            <span className="crm-summary-label">Total Deals</span>
                        </div>
                        <div className="crm-summary-trend up">
                            <FaArrowUp /> {summary.deals?.pipeline?.find(s => s._id === 'closed-won')?.count || 0} won
                        </div>
                    </div>
                    <div className="crm-summary-card">
                        <div className="crm-summary-icon revenue"><FaChartLine /></div>
                        <div className="crm-summary-info">
                            <span className="crm-summary-value">{formatMoney(summary.deals?.wonValue || 0)}</span>
                            <span className="crm-summary-label">Revenue Won</span>
                        </div>
                        <div className="crm-summary-trend">
                            of {formatMoney(summary.deals?.totalValue || 0)} pipeline
                        </div>
                    </div>
                </div>
            )}

            <div className="crm-tabs-wrapper">
                <div className="crm-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`crm-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="crm-tab-icon">{tab.icon}</span>
                            <span className="crm-tab-label">{tab.label}</span>
                            {activeTab === tab.key && <span className="crm-tab-indicator" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="crm-content" key={activeTab}>
                {activeTab === 'contacts' && <ContactList />}
                {activeTab === 'companies' && <CompanyList />}
                {activeTab === 'deals' && <DealPipeline />}
            </div>
        </div>
    );
}

export default CRM;
