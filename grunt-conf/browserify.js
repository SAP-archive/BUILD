'use strict';
module.exports = {

    dev: {
        options: {
            browserifyOptions: {
                debug: false // true to create map file
            },
            // watch: true //invoke watchify instead of browserify
        },
        files: {
            'dev/assets/bundle.js': [ 'client/app.js' ]
        }
    }

};


