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
                    sprite: '../assets/norman-user-research-client.svg',
                    bust: false,
                    render: {
                        less: true
                    },
                    dest: 'styles',
                    prefix: '.user-research-'
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
