'use strict';
module.exports = {
    sprite: {
        files: {
            'dev/resources/norman-prototype-editors-client/sprite.less': 'dev/resources/norman-prototype-editors-client/sprite.less'
        },
        options: {
            replacements: [
                {
                    pattern: /norman-prototype-editors-client\.svg/,
                    replacement: '../resources/norman-prototype-editors-client/norman-prototype-editors-client.svg'
                },
                {
                    pattern: /svg-common/g,
                    replacement: 'svg-prototype'
                },
                //TODO: update the source class names instead. for compatibility purposes only
                {
                    pattern: /prototype-DataModeler--assets--svg--/g,
                    replacement: 'dmsvg-'
                },
                {
                    pattern: /prototype-UIComposer--assets--/g,
                    replacement: 'prototype-assets--'
                },
                {
                    pattern: /-hover/g,
                    replacement: ':hover'
                }
            ]
        }
    }
};
