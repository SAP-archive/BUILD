'use strict';
module.exports = {

    dist: {
        files: [{
            expand: true,
            cwd: 'dev/assets/',
            src: ['*.css'],
            dest: 'dist/public/assets/'
        }]
    }

};
