const router = require('express').Router();
const ensureAuthenticated = require('../Middleware/Auth');
const { contactValidation } = require('../Middleware/CrmValidation');
const {
    createContact,
    fetchAllContacts,
    getContactById,
    updateContact,
    deleteContact,
    getContactStats
} = require('../Controllers/ContactController');

router.get('/stats', ensureAuthenticated, getContactStats);
router.get('/', ensureAuthenticated, fetchAllContacts);
router.get('/:id', ensureAuthenticated, getContactById);
router.post('/', ensureAuthenticated, contactValidation, createContact);
router.put('/:id', ensureAuthenticated, updateContact);
router.delete('/:id', ensureAuthenticated, deleteContact);

module.exports = router;
