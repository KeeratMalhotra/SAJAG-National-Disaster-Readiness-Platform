const User = require('../models/User');
const Announcement = require('../models/Announcement');
const adminController = {
    showPendingPartnersPage: async (req, res) => {
            try {
                const adminState = req.user.state;
                const pendingUsers = await User.findPendingByState(adminState);
                res.render('pages/manage_partners', {
                    pageTitle: 'Manage Partners',
                    user: req.user,
                    pendingPartners: pendingUsers
                });
            } catch (error) {
                res.status(500).send('Server error');
            }
        },

    updatePartnerStatus: async (req, res) => {
        try {
            const { userId } = req.params;
            const { status } = req.body; // Expect 'active' or 'rejected'

            if (!['active', 'rejected'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status.' });
            }

            const updatedUser = await User.updateStatus(userId, status);
            res.status(200).json({ message: `User status updated to ${status}.`, user: updatedUser });
        } catch (error) {
            res.status(500).json({ message: 'Server error updating user status.' });
        }
    },
    createAnnouncement: async (req, res) => {
        try {
            const { title, content } = req.body;
            const { id, role, state } = req.user; // Get info from logged-in admin

            let announcementScope = 'state'; // Default scope is 'state'
            let announcementState = state;   // Default state is the admin's state

            // If the user is an NDMA admin, they create a 'national' announcement
            if (role === 'ndma_admin') {
                announcementScope = 'national';
                announcementState = null; // National announcements have no state
            }

            const newAnnouncement = await Announcement.create({
                title,
                content,
                scope: announcementScope,
                state: announcementState,
                creatorUserId: id
            });
            
            res.status(201).json({ message: 'Announcement created successfully!', announcement: newAnnouncement });
        } catch (error) {
            res.status(500).json({ message: 'Server error creating announcement.' });
        }
    }
};

module.exports = adminController;