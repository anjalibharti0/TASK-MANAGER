const mongoose = require('mongoose');
const DealModel = require('../Models/DealModel');

const createDeal = async (req, res) => {
    try {
        const { title, value, stage, contactId, companyId, expectedCloseDate, notes } = req.body;
        const deal = new DealModel({
            title,
            value: value || 0,
            stage: stage || 'lead',
            contactId: contactId || null,
            companyId: companyId || null,
            expectedCloseDate: expectedCloseDate || null,
            notes: notes || '',
            userId: req.user._id
        });
        await deal.save();
        res.status(201).json({ success: true, message: 'Deal created', data: deal });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error creating deal', error: err.message });
    }
};

const fetchAllDeals = async (req, res) => {
    try {
        const { stage, search } = req.query;
        const filter = { userId: req.user._id };

        if (stage) filter.stage = stage;
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const data = await DealModel.find(filter)
            .populate('contactId', 'firstName lastName email')
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching deals', error: err.message });
    }
};

const getDealById = async (req, res) => {
    try {
        const deal = await DealModel.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('contactId', 'firstName lastName email phone')
            .populate('companyId', 'name industry');
        if (!deal) {
            return res.status(404).json({ success: false, message: 'Deal not found' });
        }
        res.status(200).json({ success: true, data: deal });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching deal', error: err.message });
    }
};

const updateDeal = async (req, res) => {
    try {
        const updated = await DealModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Deal not found' });
        }
        const data = await DealModel.find({ userId: req.user._id })
            .populate('contactId', 'firstName lastName')
            .populate('companyId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'Deal updated', data });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating deal', error: err.message });
    }
};

const deleteDeal = async (req, res) => {
    try {
        const deleted = await DealModel.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Deal not found' });
        }
        res.status(200).json({ success: true, message: 'Deal deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting deal', error: err.message });
    }
};

const getDealStats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const total = await DealModel.countDocuments({ userId });

        const stageAgg = await DealModel.aggregate([
            { $match: { userId } },
            { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } }
        ]);

        const totalValue = await DealModel.aggregate([
            { $match: { userId } },
            { $group: { _id: null, total: { $sum: '$value' } } }
        ]);

        const wonValue = await DealModel.aggregate([
            { $match: { userId, stage: 'closed-won' } },
            { $group: { _id: null, total: { $sum: '$value' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                pipeline: stageAgg,
                totalValue: totalValue[0]?.total || 0,
                wonValue: wonValue[0]?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching stats", error: err.message });
    }
};

module.exports = { createDeal, fetchAllDeals, getDealById, updateDeal, deleteDeal, getDealStats };
