// /src/controllers/adminController.js

const AdminModel = require('../models/adminModel');
const { validationResult } = require('express-validator'); // Useful for middleware validation

// --- UTILITY ---

/**
 * Renders an error view for administrative actions.
 */
const renderAdminError = (res, message, status = 400) => {
    return res.status(status).render('layouts/error', {
        title: 'Admin Error',
        errorCode: status,
        message: message,
        // Assuming user data is available on res.locals from auth middleware
        user: res.locals.user || null 
    });
};

// --- VIEWS ---

/**
 * Renders the Admin Dashboard view.
 * @route GET /admin/dashboard
 */
exports.renderDashboard = (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        activeTab: 'dashboard',
        // Data for dynamic components (e.g., charts) would be fetched here
    });
};

/**
 * Renders the User Management view with a list of all users.
 * @route GET /admin/users
 */
exports.renderUserManagement = async (req, res) => {
    try {
        const users = await AdminModel.getAllUsers();
        res.render('admin/user-management', {
            title: 'User Management',
            activeTab: 'users',
            users: users,
            // Assuming flash messages are used for success/error alerts
            alert: req.session.alert 
        });
        delete req.session.alert;
    } catch (error) {
        console.error('Error fetching users:', error);
        return renderAdminError(res, 'Could not load user data.', 500);
    }
};

/**
 * Renders the All Shipments view.
 * @route GET /admin/shipments
 */
exports.renderAllShipments = async (req, res) => {
    try {
        const shipments = await AdminModel.getAllShipments();
        res.render('admin/all-shipments', {
            title: 'All Shipments',
            activeTab: 'shipments',
            shipments: shipments,
            alert: req.session.alert 
        });
        delete req.session.alert;
    } catch (error) {
        console.error('Error fetching shipments:', error);
        return renderAdminError(res, 'Could not load shipment data.', 500);
    }
};


// --- ACTIONS ---

/**
 * Toggles a user's active status (block/unblock).
 * @route POST /admin/users/toggle-status/:userId
 */
exports.toggleUserStatus = async (req, res) => {
    // 1. Input Validation
    const userId = parseInt(req.params.userId);
    const newStatus = parseInt(req.body.is_active); 

    if (isNaN(userId) || isNaN(newStatus) || (newStatus !== 0 && newStatus !== 1)) {
        req.session.alert = { type: 'error', message: 'Invalid user ID or status provided.' };
        return res.redirect('/admin/users');
    }

    // Prevents admin from locking themselves out (assuming admin is role=admin)
    if (userId === req.session.user.user_id && req.session.user.role === 'admin') {
         req.session.alert = { type: 'error', message: 'Admin cannot deactivate their own account.' };
         return res.redirect('/admin/users');
    }

    try {
        const result = await AdminModel.toggleUserStatus(userId, newStatus);
        
        if (result.changes === 0) {
            req.session.alert = { type: 'warning', message: `User ID ${userId} not found or status already set.` };
        } else {
            const action = newStatus === 1 ? 'activated' : 'deactivated';
            req.session.alert = { type: 'success', message: `User ID ${userId} successfully ${action}.` };
        }
        res.redirect('/admin/users');

    } catch (error) {
        console.error('Error toggling user status:', error);
        req.session.alert = { type: 'error', message: 'Server error while updating user status.' };
        res.redirect('/admin/users');
    }
};

/**
 * Updates the status of a specific shipment.
 * @route POST /admin/shipments/update-status
 */
exports.updateShipmentStatus = async (req, res) => {
    // Basic server-side validation (additional can be done with express-validator middleware)
    const { trackingNumber, status } = req.body;

    if (!trackingNumber || !status || status.length < 2 || status.length > 50) {
        req.session.alert = { type: 'error', message: 'Invalid tracking number or status provided.' };
        return res.redirect('/admin/shipments');
    }

    try {
        const result = await AdminModel.updateShipmentStatus(trackingNumber, status);
        
        if (result.changes === 0) {
            req.session.alert = { type: 'warning', message: `Shipment ${trackingNumber} not found.` };
        } else {
            req.session.alert = { type: 'success', message: `Shipment ${trackingNumber} status updated to: ${status}.` };
        }
        res.redirect('/admin/shipments');

    } catch (error) {
        console.error('Error updating shipment status:', error);
        req.session.alert = { type: 'error', message: 'Server error while updating shipment status.' };
        res.redirect('/admin/shipments');
    }
};