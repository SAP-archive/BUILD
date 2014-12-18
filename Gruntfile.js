'use strict';

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);


    // Load grunt tasks automatically, when needed
    require('jit-grunt')(grunt, {
        injector      : 'grunt-asset-injector',
        ngtemplates   : 'grunt-angular-templates',
        protractor    : 'grunt-protractor-runner',
        express       : 'grunt-express-server',
        ngAnnotate    : 'grunt-ng-annotate'
    });


    // Define the configuration for all the tasks
    grunt.initConfig({
        // vars
        env: {
            dev: {NODE_ENV: 'development'},
            prod: {NODE_ENV: 'production'}
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: require('./grunt-conf/eslint.js'),

        // Empties folders to start fresh
        clean: require('./grunt-conf/clean.js'),

        // Convert less to css
        less: require('./grunt-conf/less.js'),

        // Minify css
        cssmin: require('./grunt-conf/cssmin.js'),

        // Minify js
        uglify: require('./grunt-conf/uglify.js'),

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: require('./grunt-conf/ngannotate.js'),

        // Copies remaining files to places other tasks can use
        copy: require('./grunt-conf/copy.js'),

        // wrap node modules for browser
        browserify: require('./grunt-conf/browserify.js'),

        // externalize source maps from bundle.js
        exorcise: {bundle: {files: {'dev/assets/bundle.js.map': ['dev/assets/bundle.js']}}},

        // Test settings
        karma: require('./grunt-conf/karma.js'),

        // Watch files
        watch: require('./grunt-conf/watch.js'),


        /*** SERVER *******************************************************************************/
        // Server settings
        express: require('./grunt-conf/express.js'),

        // Server tests
        mochaTest: require('./grunt-conf/mocha.js'),

        // e2e tests
        protractor: require('./grunt-conf/protractor.js'),

        // Debugging with node inspector
        'node-inspector': {
            custom: {
                options: {
                    'web-host': 'localhost',
                    'no-preload': true
                }
            },
            liveEdit: {
                options: {
                    'save-live-edit': true,
                    'web-host': 'localhost',
                    'no-preload': true
                }
            }
        },

        'nodemon': {
            debug: {
                script: 'server/app.js',
                options: {
                    watch: ['server'],
                    nodeArgs: ['--debug-brk'],
                    ignore: ['node_modules/**', '.git/', 'Gruntfile.js'],
                    env: {
                        PORT: process.env.PORT || 9000
                    },
                    callback: function (nodemon) {
                        nodemon.on('log', function (event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function () {
                            setTimeout(function () {
                                require('open')('http://localhost:8080/debug?port=5858');
                            }, 500);
                        });
                    }
                }
            }
        },

        'concurrent': {
            debug: {
                tasks: [
                    'nodemon:debug',
                    'node-inspector:custom'
                ],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });


    grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
        this.async();
    });

    grunt.registerTask('serve', function (target) {
        var tasks = {
            debug: [
                'env:dev',
                'concurrent:debug'
            ],
            dev: [
                'build:dev',
                'env:dev',
                'express:dev',
                'watch'
            ]
        };
        return grunt.task.run(tasks[target || 'dev']);
    });


    grunt.registerTask('test', function (target) {
        var tasks = {
            server : [ 'eslint', 'env:dev', 'mochaTest' ],
            client : [ 'eslint', 'env:dev', 'karma' ],
            e2e    : [ 'express:dev', 'protractor' ],
            dflt   : [ 'test:server', 'test:client' ]
        };
        return grunt.task.run(tasks[target || 'dflt']);
    });


    grunt.registerTask('build', function (target) {
        target = target || 'dev';
        var tasks = [
            'eslint',
            'clean:' + target,
            'less',
            'copy:html',
            'copy:dev',
            'browserify',
            'ngAnnotate'
        ];
        if (target === 'dev') {
            tasks.push('exorcise');
        }
        else {
            tasks.push('copy:dist');
            tasks.push('cssmin');
            tasks.push('uglify');
        }
        // tasks.push('test:client');
        // tasks.push('test:server');

        return grunt.task.run(tasks);
    });


    // just run (app must be already built)
    grunt.registerTask('start', ['env:dev', 'express:dev', 'watch']);

    grunt.registerTask('dist', ['build:dist']);
    grunt.registerTask('dev', ['build:dev']);
    grunt.registerTask('default', ['build:dev']);

};
