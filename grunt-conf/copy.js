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
                    'welcome/*.html',
                    'assets/**/*',
                    '*.{ico,txt}',
                    '.htaccess'
                ]
            },
            // vendor (i.e. bootstrap) css
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: [ 'node_modules/bootstrap/dist/css/bootstrap.css*' ]
            },
            {
                expand: true,
                dest: 'dev',
                src: [ 'node_modules/norman*/**/*.{html,png,gif,jpg,svg}' ]
            }
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
