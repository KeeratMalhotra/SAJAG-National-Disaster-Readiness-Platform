const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protectRoute } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');


router.use(protectRoute);
router.use(requireRole(['sdma_admin', 'ndma_admin']));
router.patch('/partners/:userId/status', adminController.updatePartnerStatus);
router.patch('/partners/:userId/status', adminController.updatePartnerStatus);
router.post('/announcements', adminController.createAnnouncement);

router.delete('/announcements/:id', adminController.deleteAnnouncement);
router.get('/documents/:filename', adminController.downloadDocument);
router.post('/announcements/mark-as-read', adminController.markAnnouncementsAsRead);
module.exports = router;