'use strict';
module.exports = {
    html: {
        files: [
            {
                expand: true,
                cwd: '<%= env.client %>',
                dest: 'dev',
                src: ['index.html', 'welcome/*.html']
            },
            {
                expand: true,
                cwd: 'client',
                dest: 'dev/resources/norman-shell-client/',
                src: ['**/*.html']
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.html',
                    '!norman*client/node_modules/**/*.html'
                ]
            }
        ]
    },
    dev: {
        files: [
            {
                expand: true,
                cwd: '<%= env.client %>',
                dest: 'dev',
                src: ['assets/**/*', '*.{ico,txt}', '!assets/**/*.less']
            },

           // module
            {
                expand: true,
                cwd: 'client',
                dest: 'dev/resources/norman-shell-client/',
                src: [ '**/*.{png,gif,jpg,svg,pdf}' ]
            },
            {
                expand: true,
                dest: 'dev/resources/',
                cwd: 'node_modules/',
                src: [ 'norman*client/**/*.{png,gif,jpg,svg}' ]
            },

            // roboto font
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: ['node_modules/norman-common-client/fonts/Roboto/*.*']
            }
        ]
    },

    testResult: {
        files: [
            {
                flatten: true,
                expand: true,
                cwd: 'reports/coverage/clientTmp',
                dest: 'reports/coverage/client',
                src: [ 'PhantomJS*/lcov.info' ]
            }
        ]
    },

    dist: {
        files: [
            {
                expand: true,
                dot: true,
                cwd: 'dev',
                dest: 'dist',
                src: '**/*'
            },
            {
                expand: true,
                cwd: '<%= env.server %>',
                dest: 'dist',
                src: [
                    '**/*.js'
                ]
            }

        ]
    }

};
