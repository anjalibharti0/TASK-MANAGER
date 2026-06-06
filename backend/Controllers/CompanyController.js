const CompanyModel = require('../Models/CompanyModel');
const ContactModel = require('../Models/ContactModel');

const createCompany = async (req, res) => {
    try {
        const { name, industry, website, phone, email, address, notes } = req.body;
        const company = new CompanyModel({
            name,
            industry: industry || '',
            website: website || '',
            phone: phone || '',
            email: email || '',
            address: address || '',
            notes: notes || '',
            userId: req.user._id
        });
        await company.save();
        res.status(201).json({ success: true, message: 'Company created', data: company });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating company', error: err.message });
    }
};

const fetchAllCompanies = async (req, res) => {
    try {
        const { search } = req.query;
        const filter = { userId: req.user._id };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } }
            ];
        }

        const data = await CompanyModel.find(filter).sort({ createdAt: -1 });

        const companiesWithCount = await Promise.all(
            data.map(async (company) => {
                const contactCount = await ContactModel.countDocuments({ companyId: company._id, userId: req.user._id });
                return { ...company.toObject(), contactCount };
            })
        );

        res.status(200).json({ success: true, data: companiesWithCount });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching companies', error: err.message });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const company = await CompanyModel.findOne({ _id: req.params.id, userId: req.user._id });
        if (!company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        const contacts = await ContactModel.find({ companyId: company._id, userId: req.user._id });
        res.status(200).json({ success: true, data: { ...company.toObject(), contacts } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching company', error: err.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const updated = await CompanyModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        const data = await CompanyModel.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'Company updated', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating company', error: err.message });
    }
};

const deleteCompany = async (req, res) => {
    try {
        const deleted = await CompanyModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }
        await ContactModel.updateMany(
            { companyId: req.params.id, userId: req.user._id },
            { $set: { companyId: null } }
        );
        res.status(200).json({ success: true, message: 'Company deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting company', error: err.message });
    }
};

module.exports = { createCompany, fetchAllCompanies, getCompanyById, updateCompany, deleteCompany };
