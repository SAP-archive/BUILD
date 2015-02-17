'use strict';
/*
 * grunt-inspector
 * https://github.com/ChrisWren/grunt-inspector
 *
 * Copyright (c) 2013 Chris Wren
 * Licensed under the MIT license.
 */
/*jshint node: true*/
module.exports = {
    task: function (grunt) {
        grunt.registerMultiTask('node-inspector', 'Runs node-inspector to debug your node.js JavaScripts', function () {
            var options = this.options();
            var done = this.async();
            var args = [];
            [
                'web-port',
                'web-host',
                'debug-port',
                'save-live-edit',
                'readTimeout',
                'stack-trace-limit',
                'preload',
                'hidden'
            ].forEach(function (option) {
                    if (option in options) {
                        args.push('--' + option);

                        if (option === 'hidden') {
                            args.push('\'' + JSON.stringify(options[option]) + '\'');

                        }
                        else {
                            args.push(options[option]);
                        }

                    }
                });
            grunt.util.spawn({
                    cmd: 'node-inspector',
                    args: args,
                    opts: {
                        stdio: 'inherit'
                    }
                },
                function (error) {
                    console.log("Make sure node-inspector is installed globally using \npm install -g node-inspector\"");
                    if (error) {
                        grunt.fail.fatal(error);
                    }
                    done();
                });
        });

    },

    config: {

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
                'preload': false
            }
        }

    }
};
