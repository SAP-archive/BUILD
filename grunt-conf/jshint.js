'use strict';
module.exports = {
    options: {
        jshintrc: 'client/.jshintrc',
        reporter: require('jshint-stylish')
    },
    dev: [
        'client/**/*.js',
        '!client/**/*.{spec,mock}.js',
        '!client/node_modules/**/*.js',

        'node_modules/norman*/**/*.js',
        '!node_modules/norman*/**/*.{spec,mock}.js',
        '!node_modules/norman-*/node_modules/*.js'
    ],
    tests: [
        'client/**/*.{spec,mock}.js',
        '!client/node_modules/**/*.js',
        'node_modules/norman-*/**/*.{spec,mock}.js',
        '!node_modules/norman-*/node_modules/*.js'
    ]
};
