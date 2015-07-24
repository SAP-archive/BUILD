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
                    sprite: '../assets/norman-common-client.svg',
                    bust: false,
                    render: {
                        less: true
                    },
                    dest: 'styles',
                    prefix: '.common-'
                }
            },
            dest: 'client',
            shape: {
                spacing         : {
                    padding     : 1,
                    box         : 'content'
                }
            },
            svg: {
                dest: 'assets'
            }
        }
    }
};
