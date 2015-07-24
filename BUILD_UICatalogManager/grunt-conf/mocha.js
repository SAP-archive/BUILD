'use strict';
module.exports = {

    options: {
        coverage: false,
    	reporter: 'mocha-jenkins-reporter',
        coverageFolder: 'reports/coverage/server',
        mask: '**/*.spec.js',
        root: './test/',
        reportFormats: ['lcov', 'html'],
        check: {
            statements: 20,
            branches: 20,
            functions: 20,
            lines: 20
        }
    },

    src: [
        './test/int/server/*.spec.js',
         '!server/node_modules/**'
    ]

};
