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
            '!client/ui-elements/ui-highlight/*.js',
            '!client/**/*spec.js',
            '!client/tests/**/*.js',

            '!node_modules/norman*client/**/*.js',
            '!node_modules/**/test*/**/*.js',
            '!node_modules/norman*client/node_modules/**/*.js'
        ]
    }
};
