'use strict';
module.exports = {

    src: [
        'node_modules/norman-business-catalog-manager-server/**/*.spec.js',
        'node_modules/norman-business-catalog-manager-test/int/server/**/*.spec.js',
        '!node_modules/norman-business-catalog-manager-server/node_modules/**'
    ], // a folder works nicely
    options: {
        reporter: 'mocha-jenkins-reporter',
        coverageFolder: 'reports/coverage/server',
        mask: '**/*.spec.js',
        root: './node_modules/norman-business-catalog-manager-server',
        reportFormats: ['lcov'],
        check: {
            lines: 5,
            statements: 5
        }
    }
};
