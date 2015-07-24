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
                dest: 'dev/resources/norman-projects-client/',
                src: ['**/*.html']
            },
            {
                expand: true,
                cwd: 'node_modules/norman-client-tp/node_modules/',
                dest: 'dev/resources/',
                src: [
                    'angular-sap-*/**/*.html',
                    '!angular-sap-*/node_modules/**/*.html'
                ]
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.html',
                    '!norman-common-client/**/*.html',
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
            {
                expand: true,
                cwd: 'client',
                dest: 'dev/resources/norman-projects-client/',
                src: ['**/*.{png,gif,jpg,svg}']
            },
            {
                expand: true,
                dest: 'dev/resources/',
                cwd: 'node_modules/',
                src: ['norman*client/**/*.{png,gif,jpg,svg}']
            },
            {
                expand: true,
                dest: 'dev/resources/',
                cwd: 'node_modules/norman-client-tp/node_modules/',
                src: [ 'angular-sap-*/**/*.{png,gif,jpg,svg}' ]
            },
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: ['node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/fonts/Roboto/*.*']
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
    },
    testResult: {
        files: [
            {
                flatten: true,
                expand: true,
                cwd: 'reports/coverage/clientTmp',
                dest: 'reports/coverage/client',
                src: [
                    'PhantomJS*/lcov.info'
                ]
            }
        ]
    },
    server: {
        files: [
            {
                expand: true,
                cwd: 'server/',
                dest: 'node_modules/norman-projects-server/',
                src: ['**/*.*', '!node_modules/']
            }
        ]
    }
};
