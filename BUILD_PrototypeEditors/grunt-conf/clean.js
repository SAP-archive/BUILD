'use strict';
module.exports = {
    options: {
        force: true
    },
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

    reports: [
        'reports/coverage/**/*',
        'reports/coverage/**/.*',
        'reports/coverage/',
        'reports/junit/**/*',
        'reports/junit/**/.*',
        'reports/junit/',
        '0397820d2eccf02f0999a074/**/*',
        '0397820d2eccf02f0999a074/**/.*',
        '0397820d2eccf02f0999a074/'
    ]
};
