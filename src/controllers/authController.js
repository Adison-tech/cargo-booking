// /src/controllers/authController.js

const UserModel = require('../models/userModel');
const { validationResult } = require('express-validator'); // For input validation

// --- VIEWS ---

/**
 * Renders the Login page.
 * @route GET /auth/login
 */
exports.renderLogin = (req, res) => {
    if (req.session.user) {
        // If already logged in, redirect to the appropriate dashboard
        const redirectUrl = req.session.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);
    }

    res.render('public/login', {
        title: 'Login',
        // Pass session alerts (e.g., "Registration successful")
        alert: req.session.alert 
    });
    delete req.session.alert;
};

/**
 * Renders the Registration page.
 * @route GET /auth/register
 */
exports.renderRegister = (req, res) => {
    if (req.session.user) {
        // If already logged in, redirect
        const redirectUrl = req.session.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);
    }
    
    res.render('public/register', {
        title: 'Register New Account',
        alert: req.session.alert,
        formData: {} // Used to repopulate form fields on validation error
    });
    delete req.session.alert;
};

// --- ACTIONS ---

/**
 * Handles user registration form submission.
 * @route POST /auth/register
 */
exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    
    // 1. Server-side Validation Check
    if (!errors.isEmpty()) {
        req.session.alert = { type: 'error', message: errors.array().map(e => e.msg).join('; ') };
        req.session.formData = req.body; // Save form data
        return res.redirect('/auth/register');
    }

    const { email, password, firstName, lastName } = req.body;

    try {
        // 2. Check if user already exists
        const existingUser = await UserModel.findUserByEmail(email);
        if (existingUser) {
            req.session.alert = { type: 'error', message: 'An account with this email already exists.' };
            req.session.formData = req.body;
            return res.redirect('/auth/register');
        }

        // 3. Create the new user (handles hashing inside the model)
        await UserModel.createUser(email, password, firstName, lastName);

        // 4. Success feedback and redirect to login
        req.session.alert = { type: 'success', message: 'Registration successful! Please log in.' };
        return res.redirect('/auth/login');

    } catch (error) {
        console.error('Registration Error:', error);
        req.session.alert = { type: 'error', message: 'A server error occurred during registration.' };
        return res.redirect('/auth/register');
    }
};

/**
 * Handles user login form submission.
 * @route POST /auth/login
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Basic input presence check
    if (!email || !password) {
        req.session.alert = { type: 'error', message: 'Email and password are required.' };
        return res.redirect('/auth/login');
    }

    try {
        // 2. Find user by email
        const user = await UserModel.findUserByEmail(email);

        if (!user) {
            req.session.alert = { type: 'error', message: 'Invalid credentials or user not found.' };
            return res.redirect('/auth/login');
        }

        // 3. Verify password (uses bcrypt)
        const isMatch = await UserModel.comparePassword(password, user.password);

        if (!isMatch) {
            req.session.alert = { type: 'error', message: 'Invalid credentials or user not found.' };
            return res.redirect('/auth/login');
        }
        
        // 4. Check if account is active
        if (user.is_active === 0) {
            req.session.alert = { type: 'error', message: 'Your account is currently inactive. Please contact support.' };
            return res.redirect('/auth/login');
        }

        // 5. Successful Login: Create Session
        
        // Create a user object without the password hash for the session
        const sessionUser = {
            user_id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            role: user.role
        };

        // Store non-sensitive user data in the session
        req.session.user = sessionUser;

        // 6. Redirect to the correct dashboard
        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Login Error:', error);
        req.session.alert = { type: 'error', message: 'A server error occurred during login.' };
        return res.redirect('/auth/login');
    }
};

/**
 * Destroys the user session and logs out the user.
 * @route GET /auth/logout
 */
exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            // Optionally redirect with an error message
            return res.redirect('/'); 
        }
        // Redirect to the main landing page or login page
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.redirect('/auth/login');
    });
};