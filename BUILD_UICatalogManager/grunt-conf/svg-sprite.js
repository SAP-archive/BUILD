'use strict';
module.exports = {
    dev: {
        expand: true,
        cwd: 'client/assets',
        src: ['**/*.svg'],
        dest: 'client',

        // Target options
        options: {
            mode: {
                css: {
                    sprite: '../assets/norman-uicatalogmanager-client.svg',
                    bust: false,
                    render: {
                        less: true
                    },
                    dest: 'styles',
                    prefix:'.uicatalog-'
                }
            },
            dest: 'client',
            svg: {
                dest: 'assets'
            }
        }
    }
};
