'use strict';
module.exports = {

    dev: {
        files: [{
            expand: true,
            cwd: 'dev/assets',
            dest: 'dev/assets',
            src: [ '*.js', '!*.min.js' ]
        }]
    }

};
