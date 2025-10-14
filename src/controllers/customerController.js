// /src/controllers/customerController.js

const ShipmentModel = require('../models/shipmentModel');
const { validationResult } = require('express-validator');
const crypto = require('crypto'); // Used for generating tracking number

// Utility: Generates a unique, readable tracking number (e.g., CARGO-A1B2C3D4)
const generateTrackingNumber = () => {
    const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `CARGO-${randomBytes}`;
};

// --- VIEWS ---

/**
 * Renders the Customer Dashboard view.
 * @route GET /customer/dashboard
 */
exports.renderDashboard = (req, res) => {
    // Dashboard data (e.g., number of active shipments, recent activity)
    // would typically be fetched here and passed to the view.
    res.render('customer/dashboard', {
        title: 'Customer Dashboard',
        activeTab: 'dashboard',
        user: res.locals.user,
        alert: req.session.alert 
    });
    delete req.session.alert;
};

/**
 * Renders the Shipments List view.
 * @route GET /customer/shipments
 */
exports.renderShipmentsList = async (req, res) => {
    try {
        const customerId = req.session.user.user_id;
        const shipments = await ShipmentModel.getShipmentsByCustomer(customerId);
        
        res.render('customer/shipments-list', {
            title: 'My Shipments',
            activeTab: 'shipments',
            shipments: shipments,
            user: res.locals.user,
            alert: req.session.alert 
        });
        delete req.session.alert;
    } catch (error) {
        console.error('Error fetching customer shipments:', error);
        req.session.alert = { type: 'error', message: 'Failed to retrieve your shipment list.' };
        res.redirect('/customer/dashboard');
    }
};

/**
 * Renders the New Booking Form.
 * @route GET /customer/booking/new
 */
exports.renderNewBooking = (req, res) => {
    res.render('customer/booking-new', {
        title: 'New Cargo Booking',
        activeTab: 'booking',
        user: res.locals.user,
        // Repopulate form on error or provide empty data
        formData: req.session.formData || {}, 
        alert: req.session.alert
    });
    delete req.session.formData;
    delete req.session.alert;
};

/**
 * Renders the Edit Booking Form.
 * @route GET /customer/booking/edit/:shipmentId
 */
exports.renderEditBooking = async (req, res) => {
    const shipmentId = parseInt(req.params.shipmentId);
    const customerId = req.session.user.user_id;

    if (isNaN(shipmentId)) {
        req.session.alert = { type: 'error', message: 'Invalid shipment ID.' };
        return res.redirect('/customer/shipments');
    }

    try {
        const shipment = await ShipmentModel.getShipmentByIdAndCustomer(shipmentId, customerId);

        if (!shipment) {
            req.session.alert = { type: 'error', message: 'Shipment not found or access denied.' };
            return res.redirect('/customer/shipments');
        }
        
        if (shipment.status !== 'Pending Confirmation') {
            req.session.alert = { type: 'warning', message: `Shipment cannot be edited because its status is "${shipment.status}".` };
            return res.redirect('/customer/shipments');
        }

        res.render('customer/booking-edit', {
            title: `Edit Booking #${shipment.tracking_number}`,
            activeTab: 'shipments',
            formData: req.session.formData || shipment,
            user: res.locals.user,
            alert: req.session.alert
        });
        delete req.session.formData;
        delete req.session.alert;

    } catch (error) {
        console.error('Error rendering edit booking:', error);
        req.session.alert = { type: 'error', message: 'A server error occurred while retrieving booking details.' };
        return res.redirect('/customer/shipments');
    }
};


// --- ACTIONS ---

/**
 * Handles submission of a new booking form.
 * @route POST /customer/booking/new
 */
exports.handleNewBooking = async (req, res) => {
    const errors = validationResult(req);

    // 1. Server-side Validation Check
    if (!errors.isEmpty()) {
        req.session.alert = { type: 'error', message: errors.array().map(e => e.msg).join('; ') };
        req.session.formData = req.body;
        return res.redirect('/customer/booking/new');
    }

    const customerId = req.session.user.user_id;
    const trackingNumber = generateTrackingNumber();
    const shipmentData = req.body; 

    try {
        await ShipmentModel.createNewShipment(customerId, trackingNumber, shipmentData);

        req.session.alert = { 
            type: 'success', 
            message: `Booking successful! Your tracking number is: ${trackingNumber}` 
        };
        return res.redirect('/customer/shipments');

    } catch (error) {
        console.error('New Booking Error:', error);
        req.session.alert = { type: 'error', message: 'Failed to create new booking due to a server error.' };
        req.session.formData = req.body;
        return res.redirect('/customer/booking/new');
    }
};

/**
 * Handles submission of an edit booking form.
 * @route POST /customer/booking/edit/:shipmentId
 */
exports.handleEditBooking = async (req, res) => {
    const shipmentId = parseInt(req.params.shipmentId);
    const customerId = req.session.user.user_id;
    const updates = req.body;

    // 1. Validation and ID check
    if (isNaN(shipmentId)) {
        req.session.alert = { type: 'error', message: 'Invalid shipment ID.' };
        return res.redirect('/customer/shipments');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.alert = { type: 'error', message: errors.array().map(e => e.msg).join('; ') };
        req.session.formData = req.body;
        return res.redirect(`/customer/booking/edit/${shipmentId}`);
    }

    try {
        const result = await ShipmentModel.updateShipment(shipmentId, customerId, updates);
        
        if (result.changes === 0) {
            req.session.alert = { type: 'warning', message: 'Booking details were not changed or the booking is no longer editable.' };
        } else {
            req.session.alert = { type: 'success', message: 'Booking details successfully updated.' };
        }
        return res.redirect('/customer/shipments');

    } catch (error) {
        console.error('Edit Booking Error:', error);
        let message = error.message.includes('editable') ? error.message : 'Failed to update booking due to a server error.';
        
        req.session.alert = { type: 'error', message: message };
        req.session.formData = req.body;
        return res.redirect(`/customer/booking/edit/${shipmentId}`);
    }
};