'use strict';
module.exports = {

    html: {
        options: { livereload: true },
        files: [
            'client/**/*.html',
            'node_modules/norman*/**/*.html',
            '!node_modules/norman*/node_modules/**/*.html'
        ],
        tasks: ['newer:copy:html']
    },

    less: {
        options: { livereload: true },
        files: [
            'client/**/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/**/*.less',
'!node_modules/norman-ui-catalog-manager-server/server/lib/api/catalog/library/**/*.js' 
        ],
        tasks: ['newer:less']
    },

    jsClient: {
        options: { livereload: true },
        files: [ 'dev/assets/*.js' ],
        tasks: []
    }

};
