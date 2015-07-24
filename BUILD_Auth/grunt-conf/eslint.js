'use strict';
module.exports = {
    options: {
        config: '.eslintrc',
        ignore: false
    },
    client: {
        options: {
            config: 'client/.eslintrc',
            ignore: false
        },
        src: [
            'client/**/*.js',
            '!node_modules/**'
        ]
    },
    server: {
        options: {
            config: 'server/.eslintrc',
            ignore: false
        },
        src: [
            'server/lib/**/*.js',
            'server/MailUtility/**/*.js',
            'server/tests/**/*.js',
            '!node_modules/**'
        ]
    }
};
