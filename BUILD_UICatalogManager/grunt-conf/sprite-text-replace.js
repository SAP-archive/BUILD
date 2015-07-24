'use strict';

// Replace the generated reference to the sprite svg in the .less file to use the client assets directory variable.
module.exports = {
    replace: {
        src: 'client/styles/sprite.less',
        overwrite: true,
        replacements: [
            {
                from: 'background-image: url(../assets/',
                to: 'background-image: url(\'../resources/norman-ui-catalog-manager-client/assets/'
            },
            {
                from: '.svg)',
                to: '.svg\')'
            }
        ]
    }
}
