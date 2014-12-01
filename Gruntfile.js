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
        ngAnnotate    : 'grunt-ng-annotate',
    });



    // Define the configuration for all the tasks
    grunt.initConfig({
        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: require('./grunt-conf/jshint.js'),

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

        // Test settings
        karma: require('./grunt-conf/karma.js'),

        // Watch files
        watch: require('./grunt-conf/watch.js'),


        /*** SERVER *******************************************************************************/
        env: {
            dev: { NODE_ENV: 'development' },
            prod: { NODE_ENV: 'production' }
        },

        // Server settings
        express: require('./grunt-conf/express.js'),

        // Server tests
        mochaTest: require('./grunt-conf/mocha.js'),

        // e2e tests
        protractor: require('./grunt-conf/protractor.js'),

        // Debugging with node inspector
        'node-inspector': { custom: { options: { 'web-host': 'localhost' }}},

        // Run server in debug mode with an initial breakpoint
        // nodemon: require('./grunt-conf/nodemon.js'),

        // Open browser window
        open: { server: { url: 'http://localhost:<%= express.options.port %>' }}
    });


    grunt.registerTask('express-keepalive', 'Keep grunt running', function () { this.async(); });

    grunt.registerTask('serve', function (target) {
        var tasks = {
            debug : [
                'env:dev',
                'express:dev',
                'node-inspector'
            ],

            dev : [
                'build',
                'env:dev',
                'express:dev',
                'watch'
            ]
        };

        return grunt.task.run(tasks[target || 'dev']);
    });


    grunt.registerTask('test', function (target) {
        var tasks = {
            server : [ 'env:dev', 'mochaTest' ],
            client : [ 'env:dev', 'karma' ],
            e2e    : [ 'express:dev', 'protractor' ],
            dflt   : [ 'test:server', 'test:client' ]
        };
        return grunt.task.run(tasks[target || 'dflt']);
    });


    grunt.registerTask('build', [
        'clean:dev',
        'less',
        'copy:dev',
        'browserify',
        'ngAnnotate'
    ]);

    grunt.registerTask('dev', [
        'jshint',
        'build',
        'test:client',
        'test:server'
    ]);

    grunt.registerTask('dist', [
        'clean:dist',
        'dev',
        'cssmin',
        'uglify',
        'copy:dist'
    ]);


    grunt.registerTask('default', [ 'build' ]);

};
