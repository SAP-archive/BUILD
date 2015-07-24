'use strict';
module.exports = {

    options: {
        reporter: 'mocha-jenkins-reporter',
        coverageFolder: 'reports/coverage/server',
        mask: '**/*.spec.js',
        root: './node_modules/norman-shell-server/',
        reportFormats: ['lcov'],
        check: { lines: 50, statements: 50 }
    },

    src: [
        '<%= env.server %>/**/*.spec.js',
        'server/**/*.spec.js'
    ]

};
