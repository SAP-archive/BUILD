'use strict';

var fs = require('fs');
var path = require('path');

require('mocha-jenkins-reporter');

var projects = [
    'client',
    'server',
    'test'
];
var remote = 'origin/master';
var repo = "BusinessCatalogManager";
var settings = require("./config.json");

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

    // Load grunt tasks automatically, when needed
    require('jit-grunt')(grunt);

    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-string-replace');

    // Define the configuration for all the tasks
    grunt.initConfig({
        // vars
        env: {
            dev: {NODE_ENV: 'development', JUNIT_REPORT_PATH: 'reports/junit/TESTS-Server-all.xml'},
            junit: {NODE_ENV: 'production'},
            prod: {NODE_ENV: 'production'},
            client: 'norman-business-catalog-manager-test'
        },

        //Access information from package.json
        pkg: grunt.file.readJSON('package.json'),

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: require('./grunt-conf/eslint.js'),

        // Empties folders to start fresh
        clean: require('./grunt-conf/clean.js'),

        // Copies remaining files to places other tasks can use
        copy: require('./grunt-conf/copy.js'),

        // wrap node modules for browser
        browserify: require('./grunt-conf/browserify.js'),

        //jsdoc generation
        jsdoc: require('./grunt-conf/jsdoc.js'),

        'string-replace': require('./grunt-conf/string-replace.js'),

        // Test settings
        karma: require('./grunt-conf/karma.js'),

        // Server tests
        mocha_istanbul: require('./grunt-conf/mocha.js')
    });

    grunt.registerTask('test', function (target) {
        var tasks = {
            server: ['env:dev', 'mocha_istanbul'],
            client: ['env:dev', 'copy', 'browserify', 'karma', 'copy:testResult']
        };
        return grunt.task.run(tasks[target]);
    });

    grunt.registerTask('build', [
        'clean',
        'eslint',
        'test:client',
        'test:server'
    ]);

    grunt.registerTask('dist', [
        'build',
        'jsdoc:dist'
    ]);

    grunt.registerTask('default', ['build']);

    grunt.event.on('coverage', function (lcovFileContents, done) {
        // Check below
        done();
    });

    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);

};
