const Announcement = require('../models/Announcement');

const announcementController = {
    showAllAnnouncementsPage: async (req, res) => {
        try {
            const allAnnouncements = await Announcement.findAllForUser(req.user);
            res.render('pages/all_announcements', {
                pageTitle: 'All Announcements',
                user: req.user,
                announcements: allAnnouncements,
                activePage: 'announcements'
            });
        } catch (error) {
            res.status(500).send('Server Error');
        }
    }
};
module.exports = announcementController;