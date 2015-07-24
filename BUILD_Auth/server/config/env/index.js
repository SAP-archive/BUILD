'use strict';

var _ = require('norman-server-tp')['lodash'];

// All configurations will extend these options
// ============================================
var all = {
    // Set env
    env: process.env.NODE_ENV,

    // MongoDB connection options
    mongo: {
        grid: 'assets.files',
        options: {
            db: {
                safe: true
            }
        }
    },

    // Should we populate the DB with sample data?
    seedDB: false

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    require('./' + process.env.NODE_ENV + '.js') || {});
