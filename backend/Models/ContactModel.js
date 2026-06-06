const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        default: null
    },
    position: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['lead', 'prospect', 'customer', 'inactive'],
        default: 'lead'
    },
    tags: [{
        type: String,
        trim: true
    }],
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

ContactSchema.index({ userId: 1, email: 1 });
ContactSchema.index({ userId: 1, firstName: 1, lastName: 1 });

module.exports = mongoose.model('Contact', ContactSchema);
