const sqlite3 = require('sqlite3').verbose();

// --- Configuration ---
// Get the database path from environment variables for flexibility
const dbPath = process.env.DB_PATH || './cargoBookingSystem.db';

// --- Database Connection ---
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // Use process.exit(1) or throw an error in a real application 
        // if database connection is critical and failed.
        console.error('Database connection error:', err.message);
    } else {
        console.log(`Connected to the SQLite database at: ${dbPath}`);
        // Ensure foreign key constraints are enabled
        db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
            if (pragmaErr) {
                console.error('Error enabling foreign keys:', pragmaErr.message);
            }
        });
    }
});

// --- Promise-Wrapped Utilities ---

/**
 * Executes a single SQL query and resolves with the first row.
 * @param {string} sql - The SQL query string.
 * @param {Array<any>} params - Parameters for the query.
 * @returns {Promise<any>} The resulting row object.
 */
const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('dbGet Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Executes an SQL query and resolves with all resulting rows.
 * @param {string} sql - The SQL query string.
 * @param {Array<any>} params - Parameters for the query.
 * @returns {Promise<Array<any>>} An array of resulting row objects.
 */
const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('dbAll Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

/**
 * Executes a non-query SQL statement (INSERT, UPDATE, DELETE).
 * @param {string} sql - The SQL statement string.
 * @param {Array<any>} params - Parameters for the statement.
 * @returns {Promise<{lastID: number, changes: number}>} Metadata about the execution.
 */
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        // Using `function` syntax to access `this.lastID` and `this.changes`
        db.run(sql, params, function (err) {
            if (err) {
                console.error('dbRun Error:', err.message, 'SQL:', sql, 'Params:', params);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

/**
 * Executes a transaction by wrapping the logic in BEGIN, COMMIT, and ROLLBACK.
 * NOTE: This simplified async transaction may not handle concurrency perfectly in SQLite.
 * For true safety, the sequential methods must be executed one after another using `await`.
 * @param {Function} logic - An async function containing the sequential db operations.
 * @returns {Promise<void>}
 */
const dbTransaction = async (logic) => {
    try {
        await dbRun('BEGIN TRANSACTION');
        await logic(); 
        await dbRun('COMMIT');
    } catch (error) {
        console.error('Transaction Failed. Rolling back...', error.message);
        // Attempt to roll back, but ignore any error from the rollback itself
        await dbRun('ROLLBACK').catch(e => console.error('Rollback failed:', e.message)); 
        throw error; // Re-throw the original error
    }
};

/**
 * Gracefully closes the database connection.
 * @returns {Promise<void>}
 */
const closeDB = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
                return reject(err);
            }
            console.log('SQLite database connection closed.');
            resolve();
        });
    });
};

// --- Module Exports ---
module.exports = {
    dbGet,
    dbAll,
    dbRun,
    dbTransaction,
    closeDB,
    db, // Export the raw db instance for advanced operations if absolutely needed
};