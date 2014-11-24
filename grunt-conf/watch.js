'use strict';
module.exports = {

    js: {
        files: [
            'client/*.js',

            'client/node_modules/norman*/**/*.js',
            '!client/node_modules/norman*/node_modules/*.js',
            '!client/**/*.{spec,mock}js',

            'node_modules/norman*/**/*.js',
            '!node_modules/norman*/node_modules/*',
            '!node_modules/norman*/**/*.{spec,mock}.js'
        ],
        tasks: [
            'browserify',
            'ngAnnotate'
        ]
    },

    less: {
        files: [
            'client/*.less',
            'client/node_modules/norman*/**/*.less',
            '!client/node_modules/norman*/node_modules/*.less',

            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/*.less'
        ],
        tasks: ['less']
    },


    livereload: {
        options: { livereload: true },
        files: [ 'dev/**/*' ]
    }

};
