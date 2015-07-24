'use strict';
module.exports = {
    options: {
        config: '.eslintrc',
        ignore: false
    },
    client: {
        options: { config: 'client/.eslintrc' },
        src: [
            'client/**/*.js',
            '!client/node_modules/**',
            '!client/**/test*/**/*.js',
        ]
    },
    server: {
        options: { config: 'server/.eslintrc' },
        src: [
            'server/**/*.js',
            '!server/node_modules/**',
            '!server/**/test*/**/*.js',
        ]
    }
};
