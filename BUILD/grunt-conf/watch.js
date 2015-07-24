'use strict';
module.exports = {

    htmlFiles: {
        options: {livereload: true},
        files: [
            'client/**/*.html'
            // DO NOT add generic rules like "norman*", but rather list folders you are watching specifically. Otherwise It will slow down the grunt start tremendously and is error prone.
            // for example:
            //  'node_modules/norman-prototype-editors-client/UIComposer/**/*.html',
        ],
        tasks: ['newer:copy:html']
    },

    less: {
        options: {livereload: true},
        files: [
            'client/**/*.less'
            // DO NOT add generic rules like "norman*", but rather list folders you are watching specifically. Otherwise It will slow down the grunt start tremendously and is error prone.
            // for example:
            //  'node_modules/norman-prototype-editors-client/UIComposer/**/*.less',
        ],
        tasks: ['newer:less']
    },

    jsClient: {
        options: {livereload: true},
        files: ['dev/assets/*.js'],
        tasks: []
    }

};
