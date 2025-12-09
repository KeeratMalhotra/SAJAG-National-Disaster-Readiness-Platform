const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protectRoute } = require('../middleware/authMiddleware');

router.use(protectRoute);


router.get('/all', announcementController.showAllAnnouncementsPage);

module.exports = router;