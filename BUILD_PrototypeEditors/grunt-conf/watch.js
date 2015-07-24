'use strict';
module.exports = {
    options: { livereload: true },

    html: {
        files: [
            '<%= env.client %>/**/*.html',
            'client/**/*.html'
        ],
        tasks: ['copy:dev']
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
        tasks: [ 'eslint:client' ]
    },

    clientUIComposer: {
        files: [
            'node_modules/norman-prototype-editors-client/UIComposer/**/*.js',
            '!node_modules/norman-prototype-editors-client/UIComposer/test/**/*.js'
        ],
        tasks: [
            'test:clientUIComposer'
        ]
    },
    clientUIComposerTest: {
        files: [
            'node_modules/norman-prototype-editors-client/UIComposer/test/**/*.js'
        ],
        tasks: [
            'karma:UIComposer'
        ]

    }
};
