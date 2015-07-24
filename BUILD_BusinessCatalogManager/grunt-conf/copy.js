'use strict';
module.exports = {
    test: {
        files: [
            {
                expand: true,
                cwd: '<%= env.client %>',
                dest: 'dev',
                src: [
                    'client.js'
                ]
            },
            {
                expand: true,
                cwd: 'client',
                dest: 'dev',
                src: ['assets/**/*', '*.{ico,txt}', '!**/*.less']
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.{png,gif,jpg,svg,json}',
                    'norman*client/node_modules/**/*.{png,gif,jpg,svg}',
                    'norman*client/bower_components/**/*.{png,gif,jpg,svg,js,html,css}',
                    '!norman-openui5/**/*'
                ]
            }

        ]
    },
    testResult : {
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
    }
};
