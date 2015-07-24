'use strict';
module.exports = {
    UIComposer: {
        files: [
            {
                prepend: "@import (reference) 'variables';\n\n",
                input: 'client/UIComposer/styles/sprite.less'
            }
        ]
    }
};