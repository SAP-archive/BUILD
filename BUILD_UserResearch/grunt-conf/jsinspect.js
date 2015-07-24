'use strict';
module.exports = {
    options: {
        threshold: 30,
        diff: true,
        identifiers: true,
        failOnMatch: false,
        suppress: 100,
        reporter: 'default' // default or json
    },
    client: {
        src: [
            'client/**/*.js',
            '!client/*.js',
            '!client/tests/**/*.js',
            '!client/node_modules/**/*.js'
        ]
    },
    server: {
        src: [
            'server/**/*.js',
            '!server/tests/**/*.js',
            '!server/node_modules/**/*.js'
        ]
    }
};
