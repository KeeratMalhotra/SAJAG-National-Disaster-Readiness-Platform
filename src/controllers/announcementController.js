const Announcement = require('../models/Announcement');

const announcementController = {
    showAllAnnouncementsPage: async (req, res) => {
        try {
            const allAnnouncements = await Announcement.findAllForUser(req.user);
             const announcementIds = allAnnouncements.map(ann => ann.id);
        // Mark them all as read in the background (fire-and-forget)
        if (announcementIds.length > 0) {
            Announcement.markAllAsReadForUser(req.user.id, announcementIds);
        }
            res.render('pages/all_announcements', {
                pageTitle: 'All Announcements',
                user: req.user,
                announcements: allAnnouncements,
                activePage: 'announcements',
                unreadCount: 0 
            });
        } catch (error) {
            res.status(500).send('Server Error');
        }
    }
};
module.exports = announcementController;