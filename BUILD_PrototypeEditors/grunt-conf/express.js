'use strict';
module.exports = {
    options: {
        port: process.env.PORT || 9000,
        hostname: '127.0.0.1'
    },

    sample: {
        options: { script: 'sample/server/app.js', debug: true },
        opts: ['--max-old-space-size=2048']
    }
};
