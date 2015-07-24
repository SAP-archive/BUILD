'use strict';
module.exports = {
    options: {
        reporter: 'spec'
    },
    src: [
        'node_modules/norman-auth-server/**/*.spec.js',
        'node_modules/norman-auth-e2e/int/**/*.spec.js',
        'node_modules/norman-auth-e2e/services/**/*.spec.js',
        '!node_modules/norman-auth-server/node_modules/**'
    ]
};
