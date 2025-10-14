// /src/middleware/validationMiddleware.js

const { body } = require('express-validator');

exports.registrationValidation = [
    body('email')
        .isEmail().withMessage('Please enter a valid email address.')
        .normalizeEmail(),
        
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/\d/).withMessage('Password must contain a number.')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.'),

    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password.');
        }
        return true;
    }),
    
    body('firstName').trim().notEmpty().withMessage('First name is required.'),
    body('lastName').trim().notEmpty().withMessage('Last name is required.'),
];

exports.shipmentValidation = [
    body('origin').trim().isLength({ min: 3 }).withMessage('Origin city/port is required.'),
    body('destination').trim().isLength({ min: 3 }).withMessage('Destination city/port is required.'),
    body('weight').isFloat({ gt: 0 }).withMessage('Weight must be a positive number.'),
    body('dimensions').trim().isLength({ min: 5 }).withMessage('Dimensions are required (e.g., 10x10x10 cm).'),
    body('type').isIn(['Standard', 'Express', 'Air', 'Ocean']).withMessage('Invalid shipment type selected.'),
    body('estimatedDelivery').isDate().withMessage('Estimated delivery date must be a valid date.')
];