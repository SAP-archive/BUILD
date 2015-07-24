'use strict';

// Replace the generated reference to the sprite svg in the .less file to use the client assets directory variable.
module.exports = {
    replace: {
        src: 'client/styles/sprite.less',
        overwrite: true,
        replacements: [
            {
                from: 'background: url(../assets/',
                to: 'background: url(\'@{client-assets-dir}/'
            },
            {
                from: '.svg)',
                to: '.svg\')'
            }
        ]
    }
}
