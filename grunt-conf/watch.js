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
        files: ['server/**/*.js'],
        tasks: ['test:server']
    }

    // livereload: {
    //     options: { livereload: true },
    //     files: ['dev/**/*']
    // }
};
