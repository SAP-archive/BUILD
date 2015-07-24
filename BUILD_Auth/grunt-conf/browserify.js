'use strict';
module.exports = {
    dev: {
        options: {
            watch: true,
            browserifyOptions: {
                debug: true                    // true to create map file
            },
            external: [
                'norman-client-tp',
                'norman-shell-client',
                'norman-jquery',

                'angular',
                'angular-cookies',
                'angular-resource',
                'angular-sanitize',
                'angular-filter',
                'angular-animate',
                'angular-messages',
                'angular-ui-router',
                'angular-awesome-slider/dist/angular-awesome-slider.min'
            ]
        },
        files: {
            'dev/assets/bundle.js': [ '<%= env.client %>/app.js' ]
        }
    },

    dist: {
        options: {
            watch: true,
            browserifyOptions: {
                debug: true                    // true to create map file
            },
            external: [
                'norman-client-tp',
                'norman-shell-client',
                'norman-jquery',

                'angular',
                'angular-cookies',
                'angular-resource',
                'angular-sanitize',
                'angular-filter',
                'angular-animate',
                'angular-messages',
                'angular-ui-router',
                'angular-awesome-slider/dist/angular-awesome-slider.min'
            ]
        },
        files: {
            'dev/assets/bundle.js': ['<%= env.client %>/app.js']
        }
    },

    test: {
        options: {
            watch: true,
            browserifyOptions: {
                debug: true                    // true to create map file
            },
            transform: [[
                'browserify-istanbul', {
                    defaultIgnore: false,
                    ignore: [
                        '**/sample/**',
                        '**/client/index.js',
                        // '**/client/resolver.js',
                        '**/tests/**',
                        '**/*.json'
                    ]
                }
            ]],
            external: [
                'norman-client-tp',
                'norman-shell-client',
                'norman-jquery',

                'angular',
                'angular-cookies',
                'angular-resource',
                'angular-sanitize',
                'angular-animate',
                'angular-messages',
                'angular-ui-router',
                'angular-awesome-slider/dist/angular-awesome-slider.min'
				]
        },
        files: {
            'dev/assets/bundle.js': ['<%= env.client %>/app.js']
        }
    },

    vendor: {
        // External modules that don't need to be constantly re-compiled
        options: {
            browserifyOptions: {
                debug: true                    // true to create map file
            },
            alias: [
                'norman-client-tp',
                'norman-shell-client',
                'norman-jquery',

                'angular:',
                'angular-cookies:',
                'angular-resource:',
                'angular-sanitize:',
                'angular-animate:',
                'angular-messages:',
                'angular-ui-router:',
                'angular-awesome-slider/dist/angular-awesome-slider.min'

            ],
            external: null // Reset this here because it's not needed
        },
        files: {
            'dev/assets/vendor.js': ['.']
        }
    }
};
