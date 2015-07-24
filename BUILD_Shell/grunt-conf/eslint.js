'use strict';
module.exports = {
    options: {
        config: '.eslintrc',
        ignore: false
    },
    dev: {
        options: { config: 'client/.eslintrc' },
        src: [
            '{client,server}/**/*.js',
            '!{client,server}/tests/**/*.js'
        ]
    },

    tests: {
        src: [
            '{client,server}/tests/**/*.{spec,mock}.js'
        ]
    }
};
