'use strict';
module.exports = {
    dev: {
        files: [
            {
                expand: true,
                cwd: 'client',
                dest: 'dev',
                src: [
                    'index.html',
                    'assets/**/*',
                    '*.{ico,txt}',
                    '.htaccess'
                ]
            },
            {
                expand: true,
                dest: 'dev',
                src: [ 'node_modules/norman*/**/*.html' ]
            },

            // {
            //     expand: true,
            //     dest: 'dev',
            //     src: [
            //         'server/**/*.js',
            //         '!server/node_modules'
            //     ]
            // }

        ]
    },

    dist: {
        files: [
            {
                expand: true,
                dot: true,
                cwd: 'dev',
                dest: 'dist',
                src: '**/*'
            },
            {
                expand: true,
                cwd: 'server',
                dest: 'dist',
                src: [
                    '**/*.js'
                ]
            }

        ]
    }

};
