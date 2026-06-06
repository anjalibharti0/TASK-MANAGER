const Joi = require('joi');

const contactValidation = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().min(1).max(100).required(),
        lastName: Joi.string().min(1).max(100).required(),
        email: Joi.string().email().allow('').optional(),
        phone: Joi.string().max(20).allow('').optional(),
        companyId: Joi.string().allow(null, '').optional(),
        position: Joi.string().max(100).allow('').optional(),
        status: Joi.string().valid('lead', 'prospect', 'customer', 'inactive').optional(),
        tags: Joi.array().items(Joi.string().max(30)).optional(),
        notes: Joi.string().max(2000).allow('').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error });
    }
    next();
};

const companyValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(200).required(),
        industry: Joi.string().max(100).allow('').optional(),
        website: Joi.string().uri().allow('').optional(),
        phone: Joi.string().max(20).allow('').optional(),
        email: Joi.string().email().allow('').optional(),
        address: Joi.string().max(500).allow('').optional(),
        notes: Joi.string().max(2000).allow('').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error });
    }
    next();
};

const dealValidation = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(1).max(200).required(),
        value: Joi.number().min(0).optional(),
        stage: Joi.string().valid('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost').optional(),
        contactId: Joi.string().allow(null, '').optional(),
        companyId: Joi.string().allow(null, '').optional(),
        expectedCloseDate: Joi.date().allow(null).optional(),
        notes: Joi.string().max(2000).allow('').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: 'Bad request', error });
    }
    next();
};

module.exports = { contactValidation, companyValidation, dealValidation };
