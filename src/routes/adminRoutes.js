const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// All routes below this point require a logged-in user AND an 'admin' role
router.use(isAuthenticated, isAdmin); 

router.get('/dashboard', adminController.renderDashboard);
router.get('/users', adminController.renderUserManagement);
router.post('/users/toggle-status/:userId', adminController.toggleUserStatus);
// ... and so on

module.exports = router;