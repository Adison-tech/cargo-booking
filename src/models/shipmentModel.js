// /src/models/ShipmentModel.js

const { dbAll, dbRun, dbGet } = require('../config/database');

/**
 * Creates a new shipment record for a customer.
 * @param {number} customerId - ID of the user creating the shipment.
 * @param {string} trackingNumber - Unique generated tracking code.
 * @param {object} shipmentData - Object containing origin, destination, weight, etc.
 * @returns {Promise<object>} Metadata including lastID of the new shipment.
 */
const createNewShipment = async (customerId, trackingNumber, shipmentData) => {
    const { origin, destination, weight, dimensions, type, estimatedDelivery } = shipmentData;
    
    // Initial status is always 'Pending Confirmation'
    const status = 'Pending Confirmation'; 
    
    const sql = `
        INSERT INTO shipments 
        (customer_id, tracking_number, origin, destination, weight, dimensions, type, status, estimated_delivery) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [customerId, trackingNumber, origin, destination, weight, dimensions, type, status, estimatedDelivery];
    
    return dbRun(sql, params);
};

/**
 * Fetches all shipments belonging to a specific customer.
 * @param {number} customerId - The ID of the customer.
 * @returns {Promise<Array<object>>} Array of shipment objects.
 */
const getShipmentsByCustomer = (customerId) => {
    const sql = `
        SELECT shipment_id, tracking_number, status, origin, destination, weight, created_at
        FROM shipments 
        WHERE customer_id = ?
        ORDER BY created_at DESC
    `;
    return dbAll(sql, [customerId]);
};

/**
 * Fetches a single shipment detail by tracking number (used for public tracking).
 * @param {string} trackingNumber - The shipment's unique tracking number.
 * @returns {Promise<object | undefined>} The shipment details.
 */
const getShipmentByTrackingNumber = (trackingNumber) => {
    const sql = `
        SELECT shipment_id, tracking_number, status, origin, destination, weight, estimated_delivery, created_at, updated_at
        FROM shipments 
        WHERE tracking_number = ?
    `;
    return dbGet(sql, [trackingNumber]);
};

/**
 * Fetches a single shipment detail by ID and ensures it belongs to the customer.
 * Used for customer-specific actions like editing.
 * @param {number} shipmentId - The ID of the shipment.
 * @param {number} customerId - The ID of the customer.
 * @returns {Promise<object | undefined>} The shipment details.
 */
const getShipmentByIdAndCustomer = (shipmentId, customerId) => {
    const sql = `
        SELECT shipment_id, tracking_number, status, origin, destination, weight, dimensions, type, estimated_delivery
        FROM shipments 
        WHERE shipment_id = ? AND customer_id = ?
    `;
    return dbGet(sql, [shipmentId, customerId]);
};

/**
 * Updates an existing shipment record.
 * @param {number} shipmentId - The ID of the shipment to update.
 * @param {number} customerId - The ID of the customer (for ownership check).
 * @param {object} updates - Object containing fields to update.
 * @returns {Promise<object>} Metadata about the update (changes).
 */
const updateShipment = async (shipmentId, customerId, updates) => {
    // Only allow updates if the status is 'Pending Confirmation'
    // To prevent customers from changing details after admin processing.
    const currentShipment = await getShipmentByIdAndCustomer(shipmentId, customerId);
    
    if (!currentShipment || currentShipment.status !== 'Pending Confirmation') {
        throw new Error("Shipment cannot be modified. Status must be 'Pending Confirmation'.");
    }

    const { origin, destination, weight, dimensions, type, estimatedDelivery } = updates;
    
    const sql = `
        UPDATE shipments 
        SET origin=?, destination=?, weight=?, dimensions=?, type=?, estimated_delivery=?, updated_at=CURRENT_TIMESTAMP
        WHERE shipment_id = ? AND customer_id = ?
    `;
    const params = [origin, destination, weight, dimensions, type, estimatedDelivery, shipmentId, customerId];
    
    return dbRun(sql, params);
};


module.exports = {
    createNewShipment,
    getShipmentsByCustomer,
    getShipmentByTrackingNumber,
    getShipmentByIdAndCustomer,
    updateShipment
};