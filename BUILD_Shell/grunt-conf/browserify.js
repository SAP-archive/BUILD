'use strict';
module.exports = {

    dev: {
        options: {

            verbose: true,
            transform: [[
                'browserify-istanbul', {
                    defaultIgnore: false,
                    ignore: [
                        '**/sample/**',
                        '**/client/index.js',
                        '**/tests/**',
                        '**/*.json'
                    ]
                }
            ]],

            watch: true,
            browserifyOptions: {
                debug: true                    // true to create map file
            },
            external: [
                'norman-common-client',
                'norman-client-tp',
                'norman-auth-client',

                'angular',
                'angular-cookies',
                'angular-resource',
                'angular-sanitize',
                'angular-ui-router'
            ]
        },
        files: {
            'dev/assets/bundle.js': [ '<%= env.client %>/app.js' ]
        }
    },

    vendor: {
        // External modules that don't need to be constantly re-compiled
        options: {
            debug: false,
            alias: [
                'norman-client-tp:',
                'norman-auth-client:',
                'angular:',
                'angular-cookies:',
                'angular-resource:',
                'angular-sanitize:',
                'angular-ui-router:'
            ],
            external: null // Reset this here because it's not needed
        },
        files: {
            'dev/assets/vendor.js': [ '.' ]
        }

    }
};
