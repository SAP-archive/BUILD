'use strict';
module.exports = {
    options: {
        jshintrc: 'client/.jshintrc',
        reporter: require('jshint-stylish')
    },
    dev: [
        '{client,server}/**/*.js',
        '!{client,server}/**/*.{spec,mock}.js',
        '!{client,server}/node_modules/**/*.js'
    ],
    tests: [
        '{client,server}/**/*.{spec,mock}.js',
        '!{client,server}/node_modules/**/*.js'
    ],
    modules: [
        'node_modules/norman*/**/*.js',
        '!node_modules/norman*/node_modules/**/*.js',
    ]
};
