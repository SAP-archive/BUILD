'use strict';
module.exports = {

    htmlFiles: {
        options: {livereload: true},
        files: [
            'client/**/*.html',
            'node_modules/norman-ui-composer-client/**/*.html',
            '!node_modules/norman-ui-composer-client/node_modules/**/*.*'
            // DO NOT add generic rules like "norman*", but rather list folders you are watching specifically. Otherwise It will slow down the grunt start tremendously and is error prone.
        ],
        tasks: ['newer:copy:html']
    },

    less: {
        options: {livereload: true},
        files: [
            'client/**/*.less',
            'node_modules/norman-ui-composer-client/**/*.less',
            '!node_modules/norman-ui-composer-client/node_modules/**/*.*'
            // DO NOT add generic rules like "norman*", but rather list folders you are watching specifically. Otherwise It will slow down the grunt start tremendously and is error prone.
        ],
        tasks: ['newer:less']
    },

    jsClient: {
        options: {livereload: true},
        files: ['dev/assets/*.js'],
        tasks: []
    }

};
