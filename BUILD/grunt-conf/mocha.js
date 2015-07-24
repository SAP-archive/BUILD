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

    modules_int: {
        options: {
            reporter: 'spec'
        },

        src: [
            'node_modules/norman*test/int/**/*.spec.js'
        ]
    }

};
