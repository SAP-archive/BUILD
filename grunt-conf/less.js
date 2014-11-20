'use strict';
module.exports = {
    options: {
        paths: [ 'client' ]
    },
    dev: {
        files: {
            'dev/assets/style.css': [
                'client/*.less',
                'node_modules/norman-*/**/*.less',
                '!node_modules/norman-*/node_modules/*.less'
            ]
        }
    }
};
