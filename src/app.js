// /src/app.js

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts'); // <-- NEW: Import layout package
const dbUtils = require('./config/database'); // Import database utilities

// Load environment variables from .env file
dotenv.config();

// --- Import Routes ---
const adminRoutes = require('./routes/adminRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');

// --- Import Middleware ---
const { isAuthenticated, exposeSessionToLocals } = require('./middleware/authMiddleware'); 

const app = express();

// ========================= APPLICATION SETUP =================================

// 1. EJS View Engine Setup
app.set('view engine', 'ejs');
// __dirname is /src, so we go up one level (..) to /cargo-booking-system and then into /views
app.set('views', path.join(__dirname, '..', 'views'));

// 1b. Express Layouts Setup (Crucial for wrapping views in default.ejs)
app.use(expressLayouts); // <-- NEW: Initialize the middleware
app.set('layout', 'layouts/default'); // <-- NEW: Specify the default layout file (default.ejs)

// 2. Static Assets Setup
// All assets in /public are now served from the root URL (/)
app.use(express.static(path.join(__dirname, '..', 'public'))); 
// Specific static path for images if needed (though already covered by the line above)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// 3. Body Parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 4. Session Middleware
app.use(session({
    // Use env variable for secret
    secret: process.env.SESSION_SECRET || 'a-fallback-secret-for-session-signing-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { 
        // Read SECURE_COOKIE from env, defaults to false (development)
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    } 
}));

// 5. Custom Middleware
// Expose session user info (req.session.user) to all EJS templates as a local variable (e.g., res.locals.user)
app.use(exposeSessionToLocals);



// ========================= ROUTE HANDLERS ====================================

// Public routes (landing, track, etc.) should come first
app.use('/', publicRoutes); 

// Authentication routes (login, register, logout)
app.use('/auth', authRoutes); 

// Customer routes (requires authentication)
app.use('/customer', customerRoutes);

// Admin routes (requires authentication AND role check)
app.use('/admin', adminRoutes);


// ========================= ERROR HANDLING ====================================

// 404 handler (Catch-all for routes not defined above)
app.use((req, res, next) => {
    res.status(404).render('layouts/error', { 
        title: '404 Not Found', 
        errorCode: 404, 
        message: 'The page you are looking for doesn\'t exist.',
        user: req.session.user // Pass user to error view
    });
});

// Generic Error Handler (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('layouts/error', { 
        title: '500 Server Error', 
        errorCode: 500, 
        message: 'Something went wrong on the server.',
        user: req.session.user // Pass user to error view
    });
});


module.exports = app;
