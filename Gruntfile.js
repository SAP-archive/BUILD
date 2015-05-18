'use strict';
var helper = require('norman-build-helper');
var fs = require('fs');
var path = require('path');
var nodeInspector = require('./grunt-conf/nodeinspector.js');

var repo = "Norman";
var settings = require("./config.json");

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    // Load custom node inspector task
    nodeInspector.task(grunt);
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-wait');

    // Load grunt tasks automatically, when needed
    require('jit-grunt')(grunt, {
        injector: 'grunt-asset-injector',
        ngtemplates: 'grunt-angular-templates',
        protractor: 'grunt-protractor-runner',
        express: 'grunt-express-server',
        ngAnnotate: 'grunt-ng-annotate'
    });


    // Define the configuration for all the tasks
    grunt.initConfig({
        // vars
        env: {
            dev: {NODE_ENV: 'development'},
            prod: {NODE_ENV: 'production'}
        },

        notify_hooks: {
            options: {
                enabled: true,
                success: false,               // whether successful grunt executions should be notified automatically
                max_jshint_notifications: 5,  // maximum number of notifications from jshint output
                duration: 3                   // the duration of notification in seconds, for `notify-send only
            }
        },

        // put partials in angular cache
        html2js: require('./grunt-conf/html2js.js'),

        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: require('./grunt-conf/eslint.js'),

        // Empties folders to start fresh
        clean: require('./grunt-conf/clean.js'),

        // Convert less to css
        less: require('./grunt-conf/less.js'),

        // Autoprefixer, add vendor specific css prefix
        autoprefixer: require('./grunt-conf/autoprefixer.js'),

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

        rename: require('./grunt-conf/rename.js'),

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
        protractor: require('./grunt-conf/protractor.js')(grunt),
        

        // Debugging with node inspector
        'node-inspector': nodeInspector.config,

        nodemon: require('./grunt-conf/nodemon.js'),

        // publish in the npm registry
        publish: require('./grunt-conf/publish.js'),

        concurrent: {
            debug: {
                options: {logConcurrentOutput: true},
                tasks: [
                    'nodemon:debug',
                    'node-inspector:custom'
                ]
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
                'node-inspector:liveEdit',
                'watch'
            ],
            liveEdit: [
                'build:dev',
                'env:dev',
                'express:dev',
                'node-inspector:liveEdit',
                'watch'
            ]
        };
        return grunt.task.run(tasks[target || 'dev']);
    });


    grunt.registerTask('test', function (target) {
        var tasks = {
            server: ['env:dev', 'mochaTest:test'],
            client: ['env:dev', 'karma'],
            modules_int: ['env:dev', 'mochaTest:modules_int'],
            e2e: ['express:dev', 'wait:dev', 'protractor:e2e'],
            e2e_ci: ['express:prod', 'wait:dev', 'protractor:e2e'],
            e2e_composer: ['protractor:e2eGridHub'],
            dflt: ['test:server', 'test:client']
        };
        return grunt.task.run(tasks[target || 'dflt']);
    });


    grunt.registerTask('build', function (target) {
        target = target || 'dev';
        console.log('TARGET = ' + target);
        var tasks = [];

        tasks = [
            // 'eslint',
            'clean:' + target,
            'less',
            'autoprefixer',
            'copy:html',
            'copy:dev',
            'browserify'
        ];

        if (target !== 'dev' && target !== 'liveEdit') {
            tasks.push('ngAnnotate');
            tasks.push('exorcise');
            tasks.push('html2js');
            tasks.push('copy:dist');
            tasks.push('config-prod');
            tasks.push('cssmin');
            tasks.push('uglify');
        }
        //tasks.push('eslint:client');
        //tasks.push('eslint:server');
        // tasks.push('test:client');
        //tasks.push('test:server');

        return grunt.task.run(tasks);
    });

    // Copy production config to dist
    grunt.registerTask('config-prod', function () {
        var targetDir = path.join(__dirname, 'dist');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);
        targetDir = path.join(targetDir, 'server');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

        var buf = fs.readFileSync(path.join(__dirname, 'server/config-prod.json'));
        fs.writeFileSync(path.join(targetDir, 'config.json'), buf);
    });

    // just run (app must be already built)
    grunt.registerTask('start', ['env:dev', 'express:dev', 'watch']);

    grunt.registerTask('dist', ['build:dist']);
    grunt.registerTask('dev', ['build:dev']);
    grunt.registerTask('default', ['build:dev']);
    grunt.registerTask('liveEdit', ['server:liveEdit']);

    grunt.registerTask('npm-publish', ['dist', 'publish', 'github-update']);

    grunt.registerTask('github-update', 'Update Github issue status', function () {
        var done = this.async();
        var mailNotif = settings.GHMailNotif;
        var issueTypes = settings.GHIssueType;
        var ghUser = settings.GHUser;
        var ghPassword = settings.GHPassword;
        var projects = [];
        helper.github.updateGithub(projects, issueTypes, ghUser, ghPassword, mailNotif, repo, done);
    });

    grunt.task.run('notify_hooks');
};
