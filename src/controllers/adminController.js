const User = require('../models/User');

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
    }
};

module.exports = adminController;