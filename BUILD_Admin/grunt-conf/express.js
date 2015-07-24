'use strict';
module.exports = {
    options: {
        port: process.env.PORT || 9001,
        hostname: '127.0.0.1'
    },

    dev: {
        options: { script: 'server/app.js', debug: true }
    },

    prod: {
        options: { script: 'dist/server/app.js' }
    }
};
