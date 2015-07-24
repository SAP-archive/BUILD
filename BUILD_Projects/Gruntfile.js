'use strict';

var fs = require('fs');
var path = require('path');

require('mocha-jenkins-reporter');

var reports = path.join(process.cwd(), 'reports');
if (!fs.existsSync(reports)) {
    fs.mkdirSync(reports);
}
var junitReport = path.join(reports, 'junit');
if (!fs.existsSync(junitReport)) {
    fs.mkdirSync(junitReport);
}

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

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
            dev: {NODE_ENV: 'development', JUNIT_REPORT_PATH: 'reports/junit/TESTS-Server-all.xml'},
            prod: { NODE_ENV: 'production' },
            test: { NODE_ENV: 'test' },
            jenkins: { NODE_ENV: 'jenkins' },
            client: 'sample/client',
            server: 'sample/server'
        },

        notify_hooks: {
            options: {
                enabled: true,
                success: false,               // whether successful grunt executions should be notified automatically
                max_jshint_notifications: 5,  // maximum number of notifications from jshint output
                duration: 3                   // the duration of notification in seconds, for `notify-send only
            }
        },

        //Access information from package.json
        pkg: grunt.file.readJSON('package.json'),

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: require('./grunt-conf/eslint.js'),

        // Empties folders to start fresh
        clean: require('./grunt-conf/clean.js'),

        // Convert less to css
        less: require('./grunt-conf/less.js'),

        // Minify css
        cssmin: require('./grunt-conf/cssmin.js'),

        //Grunt wait Task for e2e testing:
        wait: require('./grunt-conf/wait.js'),

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
        exorcise: { bundle: { files: { 'dev/assets/bundle.js.map': ['dev/assets/bundle.js'] }}},

        // Test settings
        karma: require('./grunt-conf/karma.js'),

        // Watch files
        watch: require('./grunt-conf/watch.js'),

        //jsdoc generation
        jsdoc: require('./grunt-conf/jsdoc.js'),

        /*** SERVER *******************************************************************************/

        // Server settings
        express: require('./grunt-conf/express.js'),

        // Server tests
        mocha_istanbul: require('./grunt-conf/mocha.js'),

        // e2e tests
        protractor: require('./grunt-conf/protractor.js')(grunt),

        // Debugging with node inspector
        'node-inspector': { custom: { options: { 'web-host': 'localhost' }}}

    });

    grunt.registerTask('express-keepalive', 'Keep grunt running', function () { this.async(); });

    grunt.registerTask('serve', function (target) {
        var tasks = {
            debug: ['env:dev', 'build', 'express:dev', 'node-inspector', 'watch'],
            dev: ['env:dev', 'build', 'express:dev', 'watch']
        };
        return grunt.task.run(tasks[target || 'dev']);
    });

    //trim the json output from the test runner; the json from cucumber output may contain non-json entries.
    grunt.registerTask('trimJsonOutput', function () {
        console.log("triming");
        var testOutput = grunt.file.read('test/results/testReport.json');
        var data = testOutput.match(/(\[\s+\{[\s\S]*\}\s+\]\s+\}\s+\]\s+\}\s+\])/)[1];
        grunt.file.write('test/results/testReport.json', data.replace(/\]\[/g, ','));
    });

    /**
     * Dev-Note:copy tasks are required as the sample app loads the module from then node_modules directory NOT from
     * the actual server directory.
     */
    grunt.registerTask('test', function (target) {
        var tasks = {
            server: ['env:test', 'eslint:server', 'copy:server', 'mocha_istanbul'],
            client: ['env:test', 'eslint:client', 'build:test', 'karma', 'copy:testResult'],
            e2e: ['express:dev', 'wait:dev', 'protractor','wait:report','trimJsonOutput','checkTestFailed'],
            e2e_ci: ['protractor'],
            dflt:   ['env:test', 'test:server', 'test:client']
        };

        return grunt.task.run(tasks[target || 'dflt']);
    });


    /**
     * Check if any tests in the JSON report have failed, and if so, fail the associated task.
     */
    grunt.registerTask('checkTestFailed', 'My "default" task description.', function() {
        var testOutput = grunt.file.read('test/results/testReport.json');
        if (testOutput.indexOf('"status": "failed"') !== -1) {
            grunt.fail.fatal('Test failures found', 1)
        }
    });


    grunt.registerTask('build', function (target) {
        target = target || 'dev';
        var tasks = [
            'eslint',
            'clean:' + target,
            'less',
            'copy:html',
            'copy:server',
            'copy:dev',
            'browserify:' + target,
            'browserify:vendor'
        ];

        if (target === 'dist') {
            tasks.push('ngAnnotate');
            tasks.push('exorcise');
            tasks.push('copy:dist');
            tasks.push('cssmin');
            tasks.push('uglify');
        }

        return grunt.task.run(tasks);
    });

    grunt.event.on('coverage', function (lcovFileContents, done) {
        // Check below
        done();
    });

    grunt.registerTask('start', ['env:dev', 'express:dev', 'watch']);
    grunt.registerTask('dist', ['env:dev', /*'build:dist',*/ 'test']);
    grunt.registerTask('dev', ['build:dev', 'test']);
    grunt.registerTask('default', ['build:dev', 'test']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);

    grunt.task.run('notify_hooks');
};
