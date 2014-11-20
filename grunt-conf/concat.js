'use strict';
module.exports = {
    options: {
        separator: ';',
    },

    js: {
        dest: '.tmp/concat.js',
        src: [
            'client/app/config.js',
            'client/app/app.js',

            'client/{app,components,modules}/**/*.config.js',
            'client/{app,components,modules}/**/*.service.js',
            'client/{app,components,modules}/**/*.controller.js',

            '!client/{app,components,modules}/**/*.spec.js',
            '!client/{app,components,modules}/**/*.mock.js',

            '.tmp/templates.js'
        ]
    }
};
