'use strict';
module.exports = {
    client: {
        options: {
            config: 'client/.eslintrc',
            ignore: false
        },
        src: [
            'client/**/*.js'
        ]
    },
    server: {
        options: {
            config: 'server/.eslintrc',
            ignore: false
        },
        src: [
            'server/**/*.js'
        ]
    }
};
