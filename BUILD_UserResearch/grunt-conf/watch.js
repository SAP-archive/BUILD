'use strict';
module.exports = {
    options: { livereload: true },

    html: {
        files: [
            '<%= env.client %>/**/*.html',
            'client/**/*.html'
        ],
        tasks: ['copy:html', 'html2js']
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
        files: [ 'dev/assets/*.js', '!dev/assets/templates.js' ],
        tasks: [ 'eslint:client' ]
    }

};
