'use strict';
module.exports = {
    dev: {
        files: [
            {
                prepend: "@import (reference) 'variables';\n\n",
                input: 'client/styles/sprite.less'
            }
        ]
    }
};
