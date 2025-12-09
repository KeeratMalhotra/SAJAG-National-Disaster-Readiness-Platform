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
            const { name, email, password, organizationName, state } = req.body;
            const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

            if (!name || !email || !password || !state || !documentUrl) {
                return res.status(400).json({ message: 'All fields, including the registration document, are required.' });
            }

            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'A user with this email already exists.' });
            }
            const newUser = await User.create(name, email, password, 'training_partner', organizationName, state, documentUrl);
        
           res.status(201).json({ message: 'Registration successful! Your account is pending approval.', user: newUser });

        } catch (error) {
            console.error('Registration Error:', error);
        if (error.message.includes('Only PDF')) {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during user registration.' });
        }
    },
    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
            }
            if (user.status !== 'active') {
                return res.status(401).json({ message: 'Your account is not active. Please wait for an admin to approve it.' });
            }           

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
            }

            const payload = {
                id: user.id,
                role: user.role,
                email: user.email, 
                state: user.state 
            };

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET, 
                { expiresIn: '1d' } 
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 24 * 60 * 60 * 1000 
            });

            res.status(200).json({ message: 'Logged in successfully! ', user: { id: user.id, name: user.name, role: user.role } });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    },
    logoutUser: (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/api/auth/login');
}
    
};

module.exports = authController;