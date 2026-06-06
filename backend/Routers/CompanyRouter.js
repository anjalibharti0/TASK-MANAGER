const router = require('express').Router();
const ensureAuthenticated = require('../Middleware/Auth');
const { companyValidation } = require('../Middleware/CrmValidation');
const {
    createCompany,
    fetchAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
} = require('../Controllers/CompanyController');

router.get('/', ensureAuthenticated, fetchAllCompanies);
router.get('/:id', ensureAuthenticated, getCompanyById);
router.post('/', ensureAuthenticated, companyValidation, createCompany);
router.put('/:id', ensureAuthenticated, updateCompany);
router.delete('/:id', ensureAuthenticated, deleteCompany);

module.exports = router;
