const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = {
    showLoginPage: (req, res) => {
        res.render('pages/login', {
            pageTitle: 'Login - SAJAG'
        });
    },

    showRegisterPage: (req, res) => {
        res.render('pages/register', {
            pageTitle: 'Register - SAJAG'
        });
    },
    registerUser: async (req, res) => {
        try {
            const { name, email, password, role, organizationName } = req.body;

            // **1. Basic Validation**
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: 'All required fields must be provided.' });
            }

            // **2. Check if user already exists**
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'A user with this email already exists.' });
            }
            
            // **3. Create the new user using the model**
            const newUser = await User.create(name, email, password, role, organizationName);

            // **4. Send a success response**
            res.status(201).json({ message: 'User registered successfully! 👍', user: newUser });

        } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({ message: 'Server error during user registration.' });
        }
    },
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;

            // **1. Find the user by email**
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
            }

            // **2. Compare the provided password with the stored hash**
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
            }

            // **3. User is authenticated, now create a JWT**
            const payload = {
    id: user.id,
    role: user.role,
    email: user.email // Add this line
};

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET, // We'll add this secret to our .env file
                { expiresIn: '1d' } // Token expires in 1 day
            );

            // **4. Send the token back in an HTTP-Only cookie**
            res.cookie('token', token, {
                httpOnly: true, // Prevents client-side JS from accessing the cookie
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.status(200).json({ message: 'Logged in successfully! ✅', user: { id: user.id, name: user.name, role: user.role } });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    },
    logoutUser: (req, res) => {
    res.clearCookie('token'); // Clear the JWT cookie
    res.redirect('/api/auth/login');
}
    // We'll add the login controller function here later
};

module.exports = authController;