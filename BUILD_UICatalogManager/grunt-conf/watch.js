'use strict';
module.exports = {

    html: {
        files: [
            '<%= env.client %>/**/*.html',
            'client/**/*.html'
        ],
        tasks: ['newer:copy:dev']
    },
    js: {
        files: [
            'client/*.js',
            '!client/**/*.{spec,mock}/js',

            '<%= env.client %>/*.js',
            '!<%= env.client %>/**/*.{spec,mock}/js'
        ],
        tasks: [
            'newer:browserify',
            'newer:ngAnnotate'
        ]
    },

    less: {
        files: [
            'client/**/*.less',
            '<%= env.client %>/**/*.less'
        ],
        tasks: ['newer:less']
    },

    server: {
        files: [
            'server/**/*.js',
            '!server/node_modules/**/*.*',
            '!server/lib/api/catalog/library/**/*.js'
        ],
        tasks: ['express:dev']
    },


    livereload: {
        options: { livereload: true },
        files: [ 'dev/**/*' ]
    }

};
