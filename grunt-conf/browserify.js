'use strict';
module.exports = {

    dev: {
        options: {
            browserifyOptions: {
                debug: true,                    // true to create map file
            }
        },
        files: {
            'dev/assets/bundle.js': [ 'client/app.js' ]
        }
    }

};
