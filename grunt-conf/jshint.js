'use strict';
module.exports = {
    options: {
        jshintrc: 'client/.jshintrc',
        reporter: require('jshint-stylish')
    },
    dev: {
        options: {
            jshintrc: 'client/.jshintrc'
        },
        src: [
            '{client,server}/**/*.js',
            '!{client,server}/**/*.{spec,mock}.js',

            'node_modules/norman*client/**/*.js',
            '!node_modules/norman*client/**/*.{spec,mock}.js',
            '!node_modules/norman*client/node_modules/**/*.js'
        ]
    },

    tests: {
        options: {
            jshintrc: 'server/.jshintrc-spec'
        },
        src: [
            '{client,server}/**/*.{spec,mock}.js',
            '!{client,server}/node_modules/**/*.js',

            'node_modules/norman*client/**/*.{spec,mock}.js',
 +          '!node_modules/norman*client/node_modules/**/*.js'
        ]
    }
};
