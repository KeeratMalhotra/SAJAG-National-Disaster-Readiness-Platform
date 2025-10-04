const express = require('express');
    const router = express.Router();
    const adminController = require('../controllers/adminController');
    const { protectRoute } = require('../middleware/authMiddleware');
    const { requireRole } = require('../middleware/roleMiddleware');

    router.use(protectRoute);
    router.use(requireRole(['sdma_admin', 'ndma_admin']));

    // GET /admin/manage-partners
    router.get('/manage-partners', adminController.showPendingPartnersPage);

    module.exports = router;