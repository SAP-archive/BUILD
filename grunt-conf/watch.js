'use strict';
module.exports = {

    js: {
        files: [
            'client/*.js',
            '!client/*.{spec, mock}.js',
            'node_modules/norman*/**/*.js',
            '!node_modules/norman*/**/*.{spec,mock}.js',
            '!node_modules/norman*/node_modules/*'
        ],
        tasks: [
            'browserify',
            'ngAnnotate'
        ]
    },

    less: {
        files: [
            'client/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/*'
        ],
        tasks: ['less']
    },


    livereload: {
        options: { livereload: true },
        files: [ 'dev/**/*' ]
    }

};
