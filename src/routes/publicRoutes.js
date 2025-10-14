// /src/routes/publicRoutes.js

const router = require('express').Router();
const publicController = require('../controllers/publicController');

// --- Public Views ---
router.get('/', publicController.renderLandingPage);
router.get('/about', publicController.renderAboutPage);
router.get('/contact', publicController.renderContactPage);

// --- Tracking Feature ---
router.get('/track', publicController.renderTrackingPage);
router.post('/track', publicController.trackShipment);

// --- Static Pages (Placeholder mapping for your file structure) ---
// Note: If you renamed your static HTML files to about.html, contact.html, etc., 
// they might be served directly from /public, but rendering via EJS here is better 
// for consistency and using the shared layout.
router.get('/privacy', (req, res) => res.render('public/privacy', { title: 'Privacy Policy' }));
router.get('/terms', (req, res) => res.render('public/terms', { title: 'Terms & Conditions' }));


module.exports = router;