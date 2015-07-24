'use strict';
module.exports = {
    options: { livereload: true },

    html: {
        files: [
            '<%= env.client %>/**/*.html',
            'client/**/*.html'
        ],
        tasks: ['newer:copy:dev']
    },
    less: {
        files: [
            'client/**/*.less',
            '<%= env.client %>/**/*.less',
            'node_modules/norman*/**/*.less',
            '!node_modules/norman*/node_modules/**/*.less'
        ],
        tasks: ['less']
    },
    jsClient: {
        files: [ 'dev/assets/*.js' ],
        tasks: [ 'eslint' ]
    }
};
