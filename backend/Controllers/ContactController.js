const mongoose = require('mongoose');
const ContactModel = require('../Models/ContactModel');

const createContact = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, companyId, position, status, tags, notes } = req.body;
        const contact = new ContactModel({
            firstName,
            lastName,
            email: email || '',
            phone: phone || '',
            companyId: companyId || null,
            position: position || '',
            status: status || 'lead',
            tags: tags || [],
            notes: notes || '',
            userId: req.user._id
        });
        await contact.save();
        res.status(201).json({ success: true, message: 'Contact created', data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating contact', error: err.message });
    }
};

const fetchAllContacts = async (req, res) => {
    try {
        const { search, status, tag } = req.query;
        const filter = { userId: req.user._id };

        if (status) filter.status = status;
        if (tag) filter.tags = tag;
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const data = await ContactModel.find(filter)
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching contacts', error: err.message });
    }
};

const getContactById = async (req, res) => {
    try {
        const contact = await ContactModel.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('companyId', 'name industry website');
        if (!contact) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        res.status(200).json({ success: true, data: contact });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching contact', error: err.message });
    }
};

const updateContact = async (req, res) => {
    try {
        const updated = await ContactModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        const data = await ContactModel.find({ userId: req.user._id }).populate('companyId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'Contact updated', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating contact', error: err.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const deleted = await ContactModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        res.status(200).json({ success: true, message: 'Contact deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting contact', error: err.message });
    }
};

const getContactStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const total = await ContactModel.countDocuments({ userId });
        const leads = await ContactModel.countDocuments({ userId, status: 'lead' });
        const prospects = await ContactModel.countDocuments({ userId, status: 'prospect' });
        const customers = await ContactModel.countDocuments({ userId, status: 'customer' });
        const inactive = await ContactModel.countDocuments({ userId, status: 'inactive' });

        const tagsAgg = await ContactModel.aggregate([
            { $match: { userId } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: { total, leads, prospects, customers, inactive, topTags: tagsAgg }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching stats', error: err.message });
    }
};

module.exports = { createContact, fetchAllContacts, getContactById, updateContact, deleteContact, getContactStats };
