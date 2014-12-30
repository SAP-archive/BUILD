'use strict';

module.exports = {

    dev: {
        options: {
            watch: true,
            browserifyOptions: {
                debug: true                    // true to create map file
            }
        },
        files: {
            'dev/assets/bundle.js': [ 'client/app.js' ]
        }
    }

};
