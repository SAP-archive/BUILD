'use strict';
module.exports = {
    dev: {
        expand: true,
        cwd: 'client/DataModeler/assets/svg',
        src: ['**/*.svg'],
        dest: 'client/DataModeler',
        // Target options
        options: {
            mode: {
                css: {
                    sprite: 'norman-data-modeler-client.svg',
                    bust: false,
                    render: {
                        less: {
                            dest: 'sprite'
                        }
                    },
                    dimensions: true,
                    dest: 'assets',
                    prefix: '.dmsvg-'
                }
            },
            dest: 'client/DataModeler',
            shape: {
                spacing: {
                    padding: 1,
                    box: 'content'
                }
            },
            svg: {
                dest: 'assets'
            }
        }
    },
    UIComposer: {
        expand: true,
        cwd: 'client/UIComposer',
        src: ['**/*.svg'],
        dest: 'client/UIComposer',
        // Target options
        options: {
            mode: {
                css: {
                    sprite: '../assets/norman-prototype-client.svg',
                    bust: false,
                    render: {
                        less: true
                    },
                    dest: 'styles',
                    prefix: '.prototype-'
                }
            },
            dest: 'client/UIComposer',
            shape: {
                spacing: {
                    padding: 1,
                    box: 'content'
                }
            },
            svg: {
                dest: 'assets'
            }
        }
    }
};
