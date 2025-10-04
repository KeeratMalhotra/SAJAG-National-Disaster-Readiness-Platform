// This is a function that returns a middleware function
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // We assume protectRoute middleware has already run and attached req.user
        const userRole = req.user.role;

        if (allowedRoles.includes(userRole)) {
            next(); // User has the required role, proceed
        } else {
            res.status(403).send('Forbidden: You do not have permission to access this resource.');
        }
    };
};

module.exports = { requireRole };