'use strict';
module.exports = {

    html: {
        options: { livereload: true },
        files: ['client/**/*.html'],
        tasks: ['newer:copy:html']
    },

    less: {
        options: { livereload: true },
        files: [
            'client/**/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/**/*.less'
        ],
        tasks: ['less']
    },

    jsClient: {
        options: { livereload: true },
        files: [ 'dev/assets/*.js' ],
        tasks: []
    },

    testsClient: {
        files: [ 'client/tests/**/*.{spec,mock}.js' ],
        tasks: [
            'jshint',
            'build',
            'test:client'
        ]
    },
    testsServer: {
        files: ['server/**/*.js'],
        tasks: [ 'test:server' ]
    }

};
