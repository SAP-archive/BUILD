'use strict';
module.exports = {

    html: {
        files: [
            'client/**/*.html',
            'node_modules/norman*/**/*.html',
            '!node_modules/norman*/node_modules/**/*.html'
        ],
        options: { livereload: true },
        tasks: ['newer:copy:dev']
    },

    less: {
        options: { livereload: true },
        files: [
            'client/**/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/**/*.less'
        ],
        tasks: ['newer:less']
    },

    jsClient: {
        options: { livereload: true },
        files: [
            'client/**/*.js',
            'node_modules/norman*/**/*.js',
            '!node_modules/norman*/node_modules/**/*.js'
        ],
        tasks: [
            'newer:eslint',
            'browserify:dev',
            'exorcise',
            'ngAnnotate',
            'test:client'
          ]
    },

    jsServer: {
        files: [
            'server/**/*.js',
            '!server/**/*.{spec,mock}.js',
            '!server/node_modules/**/*.js',
            'node_modules/norman*/server/**/*.js'
        ],
        tasks: [
            'test:server',
            'express:dev'
        ]
    }

    // livereload: {
    //     options: { livereload: true },
    //     files: ['dev/**/*']
    // }
};
