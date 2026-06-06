const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DealSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: Number,
        default: 0
    },
    stage: {
        type: String,
        enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
        default: 'lead'
    },
    contactId: {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
        default: null
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    expectedCloseDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

DealSchema.index({ userId: 1, stage: 1 });

module.exports = mongoose.model('Deal', DealSchema);
