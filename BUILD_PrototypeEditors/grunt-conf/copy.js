'use strict';
module.exports = {
    UITests: {
        files: [
            {
                expand: true,
                cwd: 'test/client',
                dest: 'dev',
                src: [
                    'client.js'
                ]
            }
        ]
    },
    sample: {
        files: [
            {
                expand: true,
                cwd: 'sample/client',
                dest: 'dev',
                src: [
                    '**/*',
                    '!**/*.less'
                ]
            },

            // extract client tp modules
            {
                expand: true,
                cwd: 'node_modules/norman-client-tp/node_modules/',
                dest: 'dev/resources/',
                src: [
                    'angular-sap-*/**/*.{pdf,png,gif,jpg,svg,html}'
                ]
            },

            // norman client resources
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.{pdf,png,gif,jpg,svg,json,html}',
                    'norman*client/node_modules/**/*.{pdf,png,gif,jpg,svg,html}'
                ]
            },

            // module css
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: [
                    'node_modules/font-awesome/css/font-awesome.css',
                    'client/node_modules/norman-ng-grid/styles/ui-grid.css',
                    'client/node_modules/norman-ng-grid/fonts/*.*'
                ]
            },

            // roboto font
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: ['node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/fonts/Roboto/*.*']
            }
        ]
    }
};
