const router = require('express').Router();
const ensureAuthenticated = require('../Middleware/Auth');
const { dealValidation } = require('../Middleware/CrmValidation');
const {
    createDeal,
    fetchAllDeals,
    getDealById,
    updateDeal,
    deleteDeal,
    getDealStats
} = require('../Controllers/DealController');

router.get('/stats', ensureAuthenticated, getDealStats);
router.get('/', ensureAuthenticated, fetchAllDeals);
router.get('/:id', ensureAuthenticated, getDealById);
router.post('/', ensureAuthenticated, dealValidation, createDeal);
router.put('/:id', ensureAuthenticated, updateDeal);
router.delete('/:id', ensureAuthenticated, deleteDeal);

module.exports = router;
