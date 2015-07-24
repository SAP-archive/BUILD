'use strict';
module.exports = {
    dist: {
        options: {
            destination: 'doc'
        },
        src: [
            '{client,server}/**/*.js',
            '!{client,server}/node_modules/**/*.js'
        ]
    }
};
