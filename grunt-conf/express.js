'use strict';
module.exports = {
    options: { port: process.env.PORT || 9000 },
    dev: { options: { script: 'server/app.js', debug: true } },
    prod: { options: { script: 'dist/server/app.js' } }
};
