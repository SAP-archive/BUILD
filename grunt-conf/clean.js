'use strict';
module.exports = {
    dev: [
        'dev/*',
        '!dev/.git*'
    ],

    dist: [
        'dist/*',
        'dist/.*',
        '!dist/.git*'
    ]
};
