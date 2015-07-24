'use strict';
module.exports = {
    options: {
        jshintrc: '<%= env.client %>/.jshintrc',
        reporter: require('jshint-stylish')
    },
    dev: {
        options: {
            jshintrc: '<%= env.client %>/.jshintrc',
        },
        src: [
            '{<%= env.client %>,<%= env.server %>}/**/*.js',
            '!<%= env.client %>,<%= env.server %>/**/*.{spec,mock}.js',

            '{client,server}/**/*.js',
            '!{client,server}/**/*.{spec,mock}.js'
        ]
    },

    tests: {
        options: {
            jshintrc: '<%= env.server %>/.jshintrc-spec',
        },
        src: [
            '{<%= env.client %>,<%= env.server %>}/**/*.{spec,mock}.js',
            '{client,server}/**/*.{spec,mock}.js'
        ]
    }
};
