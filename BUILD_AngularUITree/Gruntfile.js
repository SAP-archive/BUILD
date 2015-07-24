'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/angular-ui-tree.js',
                dest: 'dist/angular-ui-tree.min.js'
            }
        },


        cssmin: {
            build: {
                src: 'src/angular-ui-tree.css',
                dest: 'dist/angular-ui-tree.min.css'
            }
        },

        copy: {
            main: {
                src: 'package.json',
                dest: 'dist/package.json'
            },
            src: {
                src: 'src/angular-ui-tree.js',
                dest: 'dist/angular-ui-tree.js'
            }
        }



    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('dist', ['uglify', 'cssmin', 'copy:main', 'copy:src']);
    grunt.registerTask('default', ['dist']);

};