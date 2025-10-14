// /src/middleware/roleMiddleware.js

/**
 * Middleware to check if the user is an Administrator.
 * Requires isAuthenticated to be run first.
 */
exports.isAdmin = (req, res, next) => {
    // We rely on authMiddleware to ensure req.session.user exists.
    const userRole = req.session.user ? req.session.user.role : null;

    if (userRole === 'admin') {
        // User is an admin, proceed.
        return next();
    }
    
    // User is not authorized (Forbidden - 403)
    console.warn(`Unauthorized access attempt to admin area by role: ${userRole}`);
    
    // Set alert and redirect to the user's dashboard or a forbidden page
    req.session.alert = {
        type: 'error',
        message: 'Access Denied. You do not have administrative privileges.'
    };
    
    // Redirect to the general home or customer dashboard
    const redirectUrl = userRole === 'customer' ? '/customer/dashboard' : '/';
    return res.status(403).redirect(redirectUrl);
};

/**
 * Middleware to check if the user is a Customer.
 * Requires isAuthenticated to be run first.
 */
exports.isCustomer = (req, res, next) => {
    const userRole = req.session.user ? req.session.user.role : null;

    if (userRole === 'customer') {
        // User is a customer, proceed.
        return next();
    }

    // User is not authorized (Forbidden - 403)
    console.warn(`Unauthorized access attempt to customer area by role: ${userRole}`);
    
    req.session.alert = {
        type: 'error',
        message: 'Access Denied. This area is restricted to customers.'
    };
    
    // Redirect to the admin dashboard or the login page
    const redirectUrl = userRole === 'admin' ? '/admin/dashboard' : '/auth/login';
    return res.status(403).redirect(redirectUrl);
};

/**
 * General middleware to check if the user has any of the allowed roles.
 * @param {Array<string>} allowedRoles - Array of roles allowed (e.g., ['admin', 'manager']).
 */
exports.isAuthorized = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.session.user ? req.session.user.role : null;

        if (allowedRoles.includes(userRole)) {
            return next();
        }

        // User is not authorized (Forbidden - 403)
        console.warn(`Unauthorized access attempt by role: ${userRole} to restricted area.`);

        req.session.alert = {
            type: 'error',
            message: 'You are not authorized to view this resource.'
        };
        
        // Default redirect for unprivileged access
        const redirectUrl = userRole ? (userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard') : '/auth/login';
        return res.status(403).redirect(redirectUrl);
    };
};