'use strict';

// Production specific configuration
// ===========================
process.env.NODE_ENV = 'production';

module.exports = {
    mongo: {
        strategy: 'single',
        database: 'norman-auth-server',
        grid: 'assets.files',
        uri: 'mongodb://localhost/norman-auth-server',
        options: {
            db: {
                safe: true
            }
        }
    }
};
