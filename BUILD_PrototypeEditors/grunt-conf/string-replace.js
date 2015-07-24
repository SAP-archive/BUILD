'use strict';

module.exports = {
    sprite: {
        files: {
            'client/DataModeler/assets/sprite.less': 'client/DataModeler/assets/sprite.less'
        },
        options: {
            replacements: [
                {
                    pattern: /norman-data-modeler-client\.svg/,
                    replacement: '../resources/norman-prototype-editors-client/DataModeler/assets/norman-data-modeler-client.svg'
                },
                {
                    pattern: /svg-common/g,
                    replacement: 'svg-dm'
                }
            ]
        }
    },
    UIComposer: {
            files: {
            'client/UIComposer/styles/sprite.less': 'client/UIComposer/styles/sprite.less'
        },
        options: {
            replacements: [{
                pattern: 'background: url(../assets/',
                replacement: 'background: url(\'@{client-assets-dir}/'
            }, {
                pattern: '.svg)',
                replacement: '.svg\')'
            }, {
                pattern: /svg-common/g,
                replacement: 'svg-prototype'
            }]
        }
    }
};
