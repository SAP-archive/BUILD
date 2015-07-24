'use strict';
module.exports = {
    client: {
        options: {
            config: 'client/.eslintrc',
            ignore: false
        },
        src: [
            'client/**/*.js',
            '!client/node_modules/**/*.js',
            '!client/test/**/*.js'
        ]
    },
    server: {
        options: {
            config: 'server/.eslintrc',
            ignore: false
        },
        src: [
            'server/**/*.js',
            '!server/node_modules/**/*.js',
            '!server/test/**/*.js',
        ]
    }
};
