'use strict';
module.exports = {
    client: {
        options: {
            config: 'client/.eslintrc',
            ignore: false
        },
        src: [
            'client/**/*.js',
            '!client/tests/**/*.js',

            'node_modules/norman*client/**/*.js',
            'node_modules/norman-client-tp/node_modules/angular-sap-*/**/*.js',
            '!node_modules/**/test*/**/*.js',
            '!node_modules/norman*client/node_modules/**/*.js',
            '!node_modules/norman-client-tp/node_modules/angular-sap-*/node_modules/**/*.js'
        ]
    },
    server: {
        options: {
            config: 'server/.eslintrc',
            ignore: false
        },
        src: [
            'server/**/*.js',
            '!server/tests/**/*.js',

            'node_modules/norman*server/**/*.js',
            '!node_modules/**/test*/**/*.js',
            '!node_modules/norman*server/node_modules/**/*.js',
'!node_modules/norman-ui-catalog-manager-server/server/lib/api/catalog/library/**/*.js'
        ]
    }
};
