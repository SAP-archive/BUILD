'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                options: {
                    watch: false
                },
                files: {
                    'dist/zip.js': [ 'index.js' ]
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/zip.js',
                dest: 'dist/zip.min.js'
            }
        },

        copy: {
            main: {
                src: 'package.json',
                dest: 'dist/'
            }
        }

    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', ['browserify:dist']);
    grunt.registerTask('dist', ['build', 'uglify', 'copy:main']);
    grunt.registerTask('default', ['dist']);

};
