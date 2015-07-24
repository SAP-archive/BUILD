'use strict';

// Test specific configuration
// ===========================
process.env.NODE_ENV = 'test';

module.exports = {
    mongo: {
        strategy: 'single',
        database: 'norman-auth-server-test',
        grid: 'assets.files',
        uri: 'mongodb://localhost/norman-auth-server-test',
        options: {
            db: {
                safe: true
            }
        }
    }
};
