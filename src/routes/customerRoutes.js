// /src/routes/customerRoutes.js

const router = require('express').Router();
const customerController = require('../controllers/customerController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isCustomer } = require('../middleware/roleMiddleware');
const { shipmentValidation } = require('../middleware/validationMiddleware'); // Import validation

// Apply authentication and role check to ALL customer routes
router.use(isAuthenticated, isCustomer); 

// === Dashboard ===
router.get('/dashboard', customerController.renderDashboard);

// === Shipments List ===
router.get('/shipments', customerController.renderShipmentsList);

// === New Booking ===
router.get('/booking/new', customerController.renderNewBooking);
// Apply validation before handling the POST request
router.post('/booking/new', shipmentValidation, customerController.handleNewBooking);

// === Edit Booking ===
router.get('/booking/edit/:shipmentId', customerController.renderEditBooking);
// Apply validation before handling the POST request
router.post('/booking/edit/:shipmentId', shipmentValidation, customerController.handleEditBooking);

module.exports = router;