'use strict';
module.exports = {
    client: {
        src: [
            'client/**/*.js',
            '!client/node_modules/**/*.js',
            '!client/**/test/**/*.js'
        ]
    },
    server: {
        src: [
            'server/**/*.js',
            '!server/DataModeler/lib/services/model/resource/*.js',
            '!server/node_modules/**/*.js',
            '!server/**/test/**/*.js'
        ]
    }
};
