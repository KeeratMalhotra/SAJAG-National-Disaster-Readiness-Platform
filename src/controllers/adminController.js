const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training'); 
const Submission = require('../models/Submission'); 
const path = require('path'); 
const adminController = {


    
    showManagePartnersPage: async (req, res) => {
    try {
        const user = req.user;
        const { state: filterState } = req.query; 

        let pendingPartners, activePartners, rejectedPartners;
        let allStates = [];

        if (user.role === 'ndma_admin') {
           
            
            const [allPending, allActive, allRejected] = await Promise.all([
                User.findAllPending(),
                User.findAllActive(),
                User.findAllRejected()
            ]);

            const allPartners = [...allPending, ...allActive, ...allRejected];
            allStates = [...new Set(allPartners.map(p => p.state).filter(s => s && s.trim() !== ''))].sort();

            if (filterState) {
                pendingPartners = allPending.filter(p => p.state === filterState);
                activePartners = allActive.filter(p => p.state === filterState);
                rejectedPartners = allRejected.filter(p => p.state === filterState);
            } else {
                pendingPartners = allPending;
                activePartners = allActive;
                rejectedPartners = allRejected;
            }

        } else {
            const adminState = user.state;
            [pendingPartners, activePartners, rejectedPartners] = await Promise.all([
                User.findPendingByState(adminState),
                User.findActiveByState(adminState),
                User.findRejectedByState(adminState)
            ]);
            allStates = [adminState]; 
        }

        res.render('pages/manage_partners', {
            pageTitle: 'Manage Partners',
            user: req.user,
            pendingPartners,
            activePartners,
            rejectedPartners,
            allStates, 
            selectedState: filterState || '' 
        });
    } catch (error) {
        console.error('Error loading manage partners page:', error);
        res.status(500).send('Server error');
    }
},



// end new logic





//     showManagePartnersPage: async (req, res) => {
//     try {
//         const user = req.user;
//         let pendingPartners, activePartners, rejectedPartners;

//         if (user.role === 'ndma_admin') {
//             // NDMA Admin gets all partners from all states
//             [pendingPartners, activePartners, rejectedPartners] = await Promise.all([
//                 User.findAllPending(),
//                 User.findAllActive(),
//                 User.findAllRejected()
//             ]);
//         } else {
//             // SDMA Admin gets partners only from their state
//             const adminState = user.state;
//             [pendingPartners, activePartners, rejectedPartners] = await Promise.all([
//                 User.findPendingByState(adminState),
//                 User.findActiveByState(adminState),
//                 User.findRejectedByState(adminState)
//             ]);
//         }

//         res.render('pages/manage_partners', {
//             pageTitle: 'Manage Partners',
//             user: req.user,
//             pendingPartners,
//             activePartners,
//             rejectedPartners
//         });
//     } catch (error) {
//         console.error('Error loading manage partners page:', error);
//         res.status(500).send('Server error');
//     }
// },

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
    },
    deleteAnnouncement: async (req, res) => {
    try {
        const { id: announcementId } = req.params;
        const user = req.user;

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found.' });
        }

     
        let canDelete = false;

        // Rule 1: An NDMA admin can delete ANY announcement.
        if (user.role === 'ndma_admin') {
            canDelete = true;
        } 
        // Rule 2: A non-NDMA admin (i.e., an SDMA admin) can only delete their OWN state-level announcements.
        else if (announcement.scope === 'state' && announcement.creator_user_id === user.id) {
            canDelete = true;
        }
        

        if (canDelete) {
            await Announcement.deleteById(announcementId);
            res.status(200).json({ message: 'Announcement deleted successfully.' });
        } else {
            res.status(403).json({ message: 'Forbidden: You do not have permission to delete this announcement.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting announcement.' });
    }
},
showPartnerDetailsPage: async (req, res) => {
            try {
                const { partnerId } = req.params;
                const partner = await User.findById(partnerId);
                if (!partner) {
                    return res.status(404).send('Partner not found.');
                }
                
                const trainingsConducted = await Training.findByUserId(partnerId);
                const averageScore = await Submission.getAverageScoreByCreator(partnerId);

                res.render('pages/partner_details', {
                    pageTitle: `Details for ${partner.name}`,
                    user: req.user,
                    partner: partner,
                    trainings: trainingsConducted,
                    averageScore: parseFloat(averageScore)
                });

            } catch (error) {
                console.error('Error loading partner details:', error);
                res.status(500).send('Server Error');
            }
        },
        downloadDocument: (req, res) => {
        try {
            const { filename } = req.params;
            
            const filePath = path.join(__dirname, '..', '..', 'uploads', filename);

            res.download(filePath, 'registration-document.pdf', (err) => {
                if (err) {
                    console.error("Error downloading file:", err);
                    res.status(404).send('File not found.');
                }
            });
        } catch (error) {
            res.status(500).send('Server error');
        }
    },
    markAnnouncementsAsRead: async (req, res) => {
    try {
        const { announcementIds } = req.body;
        const userId = req.user.id;
        await Announcement.markAllAsReadForUser(userId, announcementIds);
        res.status(200).json({ message: 'Announcements marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
}
    
};

module.exports = adminController;