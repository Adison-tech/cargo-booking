// /src/middleware/authMiddleware.js

/**
 * Middleware to check if a user is authenticated (logged in).
 * If authenticated, the request proceeds.
 * If not authenticated, the user is redirected to the login page.
 */
exports.isAuthenticated = (req, res, next) => {
    // Check if the user object exists in the session
    if (req.session.user) {
        // User is logged in, proceed to the next middleware or route handler
        return next();
    }
    
    // User is NOT logged in. Store the intended URL before redirecting to login.
    // This allows them to be redirected back after successful login.
    req.session.redirectTo = req.originalUrl;
    
    // Set a temporary alert message
    req.session.alert = {
        type: 'warning',
        message: 'You must be logged in to access this page.'
    };
    
    // Redirect to the login page
    return res.redirect('/auth/login');
};

/**
 * Middleware to check if the user is NOT authenticated.
 * Used to prevent logged-in users from seeing the login/register pages.
 * If authenticated, redirects them to their respective dashboard.
 */
exports.isGuest = (req, res, next) => {
    if (req.session.user) {
        // User is logged in. Redirect to the appropriate dashboard.
        const redirectUrl = req.session.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);
    }
    // User is not logged in, proceed to the next middleware or route handler (e.g., render login page)
    next();
};


/**
 * Middleware that exposes the session user object to all EJS views (res.locals).
 * This makes user data (like name, role) available in templates (e.g., in the header/sidebar) 
 * without having to pass it explicitly in every render call.
 */
exports.exposeSessionToLocals = (req, res, next) => {
    // res.locals are passed to every EJS template automatically
    res.locals.user = req.session.user || null;
    
    // Also useful to expose the current path for active link highlighting
    res.locals.currentPath = req.path; 

    next();
};