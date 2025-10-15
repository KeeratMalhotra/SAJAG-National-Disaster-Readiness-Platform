const Training = require('../models/Training');

const trainingApiController = {
    deleteTraining: async (req, res) => {
        try {
            const { id: trainingId } = req.params;
            const user = req.user;

            const training = await Training.findById(trainingId);
            if (!training) {
                return res.status(404).json({ message: 'Training not found.' });
            }

            let canDelete = false;
            if (user.role === 'ndma_admin') canDelete = true;
            if (user.role === 'sdma_admin' && training.creator_state === user.state) canDelete = true;
            if (training.creator_user_id === user.id) canDelete = true;

            if (canDelete) {
                await Training.deleteById(trainingId);
                res.status(200).json({ message: 'Training deleted successfully.', redirectTo: '/dashboard' });
            } else {
                res.status(403).json({ message: 'Forbidden: You do not have permission to delete this.' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error deleting training.' });
        }
    }
};
module.exports = trainingApiController;