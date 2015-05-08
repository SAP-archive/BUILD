'use strict';
module.exports = function (grunt) {
    var cucumberTags = grunt.option('cucumberTags');

    return {
        options: {
            configFile: "grunt-conf/protractor.conf.js",
            keepAlive: false, // If false, the grunt process stops when the test fails.
            noColor: false, // If true, protractor will not use colors in its output.
            args: {

            },
            output: "./test/results/testReport.json"
        },
        e2e: {
            // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
            options: {
                //configFile: "protractor.conf.js", // Target-specific config file
                args: {

                    cucumberOpts: {
                        tags: cucumberTags
                    }

                }
            }
        }
    };
};
