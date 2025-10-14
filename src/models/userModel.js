// /src/models/UserModel.js

const { dbGet, dbRun } = require('../config/database');
const bcrypt = require('bcrypt'); // Required for password hashing/comparison

// Configuration for bcrypt
const SALT_ROUNDS = 10;

/**
 * Creates a new user in the database.
 * @param {string} email - User's email (used as username).
 * @param {string} password - Hashed password.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @returns {Promise<object>} Metadata including lastID of the new user.
 */
const createUser = async (email, password, firstName, lastName) => {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
        INSERT INTO users (email, password, first_name, last_name, role, is_active) 
        VALUES (?, ?, ?, ?, 'customer', 1)
    `;
    const params = [email, hashedPassword, firstName, lastName];
    
    return dbRun(sql, params);
};

/**
 * Finds a user by email and returns their full details, including the hashed password.
 * This is used specifically during the login process.
 * @param {string} email - The user's email address.
 * @returns {Promise<object | undefined>} The user object or undefined if not found.
 */
const findUserByEmail = (email) => {
    // Select the password here because it is needed for bcrypt comparison
    const sql = `
        SELECT user_id, email, password, first_name, last_name, role, is_active
        FROM users 
        WHERE email = ?
    `;
    return dbGet(sql, [email]);
};

/**
 * Verifies the provided plaintext password against the stored hash.
 * @param {string} password - The plaintext password.
 * @param {string} hashedPassword - The hashed password from the database.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
const comparePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = {
    createUser,
    findUserByEmail,
    comparePassword,
};