'use strict';

// Dev specific configuration
// ===========================
process.env.NODE_ENV = 'development';

module.exports = {
    mongo: {
        strategy: 'single',
        database: 'norman-auth-server-dev',
        grid: 'assets.files',
        uri: 'mongodb://localhost/norman-auth-server-dev',
        options: {
            db: {
                safe: true
            }
        }
    }
};
