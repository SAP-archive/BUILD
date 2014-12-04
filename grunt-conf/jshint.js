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
            '!{client,server}/**/*.{spec,mock}.js'
        ]
    },

    tests: {
        options: {
            jshintrc: 'server/.jshintrc-spec'
        },
        src: [
            '{client,server}/**/*.{spec,mock}.js'
        ]
    }
};
