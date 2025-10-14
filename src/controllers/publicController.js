// /src/controllers/publicController.js

const ShipmentModel = require('../models/shipmentModel');
const { validationResult } = require('express-validator');

// --- VIEWS ---

/**
 * Renders the Main Landing Page.
 * Corresponds to the index.html or index.ejs in the public folder if using EJS for static pages,
 * but since this structure uses /views for dynamic content, we render index.ejs.
 * @route GET /
 */
exports.renderLandingPage = (req, res) => {
    // Check if the user is logged in and redirect to their dashboard if so.
    if (req.session.user) {
        const redirectUrl = req.session.user.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);
    }
    
    // Render the main public landing page
    res.render('public/index', {
        title: 'Cargo Booking System - Home',
        activeTab: 'home',
        // Pass any session alerts (e.g., from failed login attempts)
        alert: req.session.alert 
    });
    delete req.session.alert;
};

/**
 * Renders the static About Us page.
 * Note: If using EJS for this, it allows using the same layout/partials (header/footer).
 * @route GET /about
 */
exports.renderAboutPage = (req, res) => {
    res.render('public/about', {
        title: 'About Us',
        activeTab: 'about'
        // User is passed via res.locals.user by authMiddleware
    });
};

/**
 * Renders the static Contact Us page.
 * @route GET /contact
 */
exports.renderContactPage = (req, res) => {
    res.render('public/contact', {
        title: 'Contact Us',
        activeTab: 'contact'
    });
};

/**
 * Renders the Shipment Tracking view.
 * @route GET /track
 */
exports.renderTrackingPage = (req, res) => {
    res.render('public/track', {
        title: 'Shipment Tracking',
        activeTab: 'track',
        // shipmentData will be null on initial GET
        shipmentData: null, 
        alert: req.session.alert
    });
    delete req.session.alert;
};

// --- ACTIONS ---

/**
 * Handles the submission of the tracking form and displays results.
 * @route POST /track
 */
exports.trackShipment = async (req, res) => {
    const { trackingNumber } = req.body;
    let shipmentData = null;
    let alert = null;

    // 1. Basic Validation
    if (!trackingNumber || trackingNumber.trim().length < 5) {
        alert = { type: 'error', message: 'Please enter a valid tracking number.' };
    } else {
        try {
            // 2. Fetch shipment data from the model
            const shipment = await ShipmentModel.getShipmentByTrackingNumber(trackingNumber.toUpperCase());
            
            if (shipment) {
                shipmentData = shipment;
                alert = { type: 'success', message: `Tracking results for ${trackingNumber}` };
            } else {
                alert = { type: 'warning', message: `No shipment found for tracking number: ${trackingNumber}` };
            }
        } catch (error) {
            console.error('Shipment Tracking Error:', error);
            alert = { type: 'error', message: 'A server error occurred during tracking.' };
        }
    }

    // 3. Render the tracking page with the results/error
    res.render('public/track', {
        title: 'Shipment Tracking Results',
        activeTab: 'track',
        shipmentData: shipmentData,
        alert: alert
    });
};