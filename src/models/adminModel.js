// /src/models/AdminModel.js

const { dbAll, dbRun, dbGet } = require('../config/database');

/**
 * Fetches a list of all users (excluding sensitive fields like password).
 * @returns {Promise<Array<object>>} Array of user objects.
 */
const getAllUsers = async () => {
    // Note: Never select the password field.
    const sql = `
        SELECT user_id, email, first_name, last_name, role, is_active, created_at
        FROM users 
        ORDER BY created_at DESC
    `;
    return dbAll(sql);
};

/**
 * Fetches a list of all shipments with associated customer info.
 * @returns {Promise<Array<object>>} Array of shipment and user data.
 */
const getAllShipments = async () => {
    const sql = `
        SELECT 
            s.shipment_id, s.tracking_number, s.status, s.weight, s.origin, s.destination, s.created_at, s.estimated_delivery,
            u.first_name, u.last_name, u.email
        FROM shipments s
        JOIN users u ON s.customer_id = u.user_id
        ORDER BY s.created_at DESC
    `;
    return dbAll(sql);
};

/**
 * Toggles the active status of a user.
 * @param {number} userId - The ID of the user to update.
 * @param {number} newStatus - 1 for active, 0 for inactive.
 * @returns {Promise<object>} Metadata about the update (changes).
 */
const toggleUserStatus = async (userId, newStatus) => {
    if (newStatus !== 0 && newStatus !== 1) {
        throw new Error("Invalid status value. Must be 0 or 1.");
    }
    const sql = `UPDATE users SET is_active = ? WHERE user_id = ?`;
    return dbRun(sql, [newStatus, userId]);
};

/**
 * Updates the status of a specific shipment by its tracking number.
 * @param {string} trackingNumber - The shipment's tracking number.
 * @param {string} newStatus - The new status (e.g., 'In Transit', 'Delivered').
 * @returns {Promise<object>} Metadata about the update (changes).
 */
const updateShipmentStatus = async (trackingNumber, newStatus) => {
    const sql = `UPDATE shipments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE tracking_number = ?`;
    return dbRun(sql, [newStatus, trackingNumber]);
};

/**
 * Fetches a single shipment by ID or tracking number. Used for status update view.
 * @param {string} trackingNumber - The shipment's tracking number.
 * @returns {Promise<object | undefined>} The shipment details.
 */
const getShipmentByTrackingNumber = async (trackingNumber) => {
    const sql = `SELECT * FROM shipments WHERE tracking_number = ?`;
    return dbGet(sql, [trackingNumber]);
};


module.exports = {
    getAllUsers,
    getAllShipments,
    toggleUserStatus,
    updateShipmentStatus,
    getShipmentByTrackingNumber
};