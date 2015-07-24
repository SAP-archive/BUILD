'use strict';
module.exports = {
    dev: [
        'dev/**/*',
        'dev/**/.*',
        '!dev/**/.git*'
    ],

    dist: [
        'dist/**/*',
        'dist/**/.*',
        '!dist/**/.git*'
    ],
     svg: [
         'client/assets/norman-common-client.svg'
     ]
};
