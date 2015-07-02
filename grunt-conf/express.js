'use strict';
module.exports = {
    options: {
        port: process.env.PORT || 9000,
        hostname: '127.0.0.1'
    },

    dev: {
        options: { script: 'server/app.js', debug: true }
    },

    init: {
        options: { script: 'server/appWithInit.js', debug: true }
    },

    prod: {
        options: { script: 'dist/server/app.js' }
    }
};
