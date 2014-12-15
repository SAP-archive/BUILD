'use strict';
module.exports = {

    html: {
        files: [ 'client/**/*.html' ],
        tasks: ['copy:dev']
    },

    less: {
        files: [
            'client/**/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/**/*.less'
        ],
        tasks: ['less']
    },

    jsClient: {
        files: [
            'client/**/*.js',
            '!client/**/*.{spec,mock}.js',
            '!client/node_modules/**/*.js',
            'node_modules/norman*/**/*.js',
            '!node_modules/norman*/node_modules/**/*.js',
            '!node_modules/norman*/**/*.{spec,mock}.js'
        ],
        tasks: [
            'browserify:dev',
            'exorcise',
            'ngAnnotate'
        ]
    },
    jsServer: {
        files: [
            'server/**/*.js',
            '!server/**/*.{spec,mock}.js',
            '!server/node_modules/**/*.js'
        ],
        tasks: []
    },

    testsClient: {
        files: [
            'client/**/*.{spec,mock}.js',
            '!client/node_modules/**/*.js'
        ],
        tasks: [
            'jshint',
            'build',
            'test:client'
        ]
    },

    testsServer: {
        files: [
            'server/**/*.{spec,mock}.js',
            '!server/node_modules/**/*.js'
        ],
        tasks: [ 'test:server' ]
    },

    livereload: {
        options: { livereload: true },
        files: [ 'dev/**/*' ]
    }

};
