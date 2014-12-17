'use strict';
module.exports = {
    options: {
        config: '.eslintrc',
        ignore: false
    },
    dev: {
        src: [
            '{client,server}/**/*.js'
        ]
    }
};
