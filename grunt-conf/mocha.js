'use strict';
module.exports = {

    test: {
    options: {
        reporter: 'spec'
    },

    src: [
        'node_modules/norman*server/tests/**/*.spec.js',
        'test/int/server/**/*.spec.js'
    ]
    },

    int: {
    }

};
