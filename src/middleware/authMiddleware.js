const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/api/auth/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Invalid token:', error);
        return res.redirect('/api/auth/login');
    }
};

module.exports = { protectRoute };