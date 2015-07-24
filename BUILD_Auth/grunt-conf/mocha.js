'use strict';
module.exports = {

    options: {
	    reporter: 'mocha-jenkins-reporter',
	    coverageFolder: 'reports/coverage/server',
	    mask: '**/*.spec.js',
	    root: './node_modules/norman-auth-server',
	    reportFormats: ['lcov'],
	    check: {
            //statements: 40,
            //branches: 20,
            //functions: 25,
            //lines: 40
            statements: 30,
            branches: 10,
            functions: 20,
            lines: 30
        }
    },
    src: [
        'node_modules/norman-auth-server/**/*.spec.js',
        'node_modules/norman-auth-e2e/int/**/*.spec.js',
        'node_modules/norman-auth-e2e/services/**/*.spec.js',
        '!node_modules/norman-auth-server/node_modules/**'
    ]
};
