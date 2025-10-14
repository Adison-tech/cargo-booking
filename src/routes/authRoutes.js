// /src/routes/authRoutes.js snippet
const router = require('express').Router();
const authController = require('../controllers/authController');
const { isGuest } = require('../middleware/authMiddleware');
// ... validation imports

// Login and Register pages should only be accessible to guests
router.get('/login', isGuest, authController.renderLogin);
router.post('/login', isGuest, authController.loginUser);

router.get('/register', isGuest, authController.renderRegister);
// ...

module.exports = router;