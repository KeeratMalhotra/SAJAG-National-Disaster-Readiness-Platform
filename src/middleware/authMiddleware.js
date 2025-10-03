const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
    // 1. Get the token from the cookies
    const token = req.cookies.token;

    // 2. If no token exists, redirect to the login page
    if (!token) {
        return res.redirect('/api/auth/login');
    }

    try {
        // 3. Verify the token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. If valid, attach the user's info to the request object
        req.user = decoded;
        
        // 5. Allow the request to proceed to the next function (the controller)
        next();
    } catch (error) {
        // 6. If token is invalid, redirect to login
        console.error('Invalid token:', error);
        return res.redirect('/api/auth/login');
    }
};

module.exports = { protectRoute };