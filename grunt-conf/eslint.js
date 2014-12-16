'use strict';
module.exports = {
    options: {
        config: '.eslintrc'
    },
    dev: {
        src: [
            '{client,server}/**/*.js',
            '!{client,server}/**/*.{spec,mock}.js'
        ]
    },

    tests: {
        src: [
            '{client,server}/**/*.{spec,mock}.js',
            '!{client,server}/node_modules/**/*.js'
        ]
    }
};
