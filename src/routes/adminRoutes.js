const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Protect all admin routes
router.use(protectRoute);
// Only allow SDMA and NDMA admins to access these routes
router.use(requireRole(['sdma_admin', 'ndma_admin']));
// PATCH /api/admin/partners/:userId/status
router.patch('/partners/:userId/status', adminController.updatePartnerStatus);
// PATCH /api/admin/partners/:userId/status
router.patch('/partners/:userId/status', adminController.updatePartnerStatus);
// POST /api/admin/announcements
router.post('/announcements', adminController.createAnnouncement);

router.delete('/announcements/:id', adminController.deleteAnnouncement);
router.get('/documents/:filename', adminController.downloadDocument);
module.exports = router;