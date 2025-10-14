// /src/server.js

const app = require('./app'); // Import the configured Express app
const { closeDB } = require('./config/database'); // Import the close function
const PORT = process.env.PORT || 3000; // Use environment variable, default to 3000

// ========================= SERVER STARTUP ====================================

// Start the Express server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Application environment: ${process.env.NODE_ENV || 'development'}`);
});

// ========================= GRACEFUL SHUTDOWN =================================

const shutdown = () => {
    console.log('\nShutting down server...');

    // 1. Stop accepting new connections
    server.close(async (err) => {
        if (err) {
            console.error('Error closing server:', err.message);
            // Exit with failure code
            process.exit(1); 
        }

        console.log('Express server closed.');

        // 2. Close database connection
        try {
            await closeDB();
            // Exit with success code
            process.exit(0); 
        } catch (dbErr) {
            console.error('Error closing database during shutdown:', dbErr.message);
            // Exit with failure code
            process.exit(1); 
        }
    });
};

// Listen for termination signals
process.on('SIGTERM', shutdown); // For process managers
process.on('SIGINT', shutdown);  // For Ctrl+C
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, then exit
    shutdown();
});