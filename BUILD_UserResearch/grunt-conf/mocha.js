'use strict';
module.exports = {

    options: {
        reporter: 'mocha-jenkins-reporter',
        coverageFolder: 'reports/coverage/server',
        mask: '**/*.spec.js',
        root: './server/',
        reportFormats: ['lcov'],
        check: { lines: 65, statements: 65 }
    },

    src: [
    'test/int/server/*.spec.js'
    ]
};
