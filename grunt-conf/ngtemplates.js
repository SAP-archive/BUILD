'use strict';
module.exports = {

    norman: {
        options: {
            htmlmin: {
                collapseWhitespace: true,
                collapseBooleanAttributes: true
            }
        },
        cwd: 'client',
        src: '{,**/}*.html',
        dest: '/scripts/templates/templates.js',
        bootstrap: normanBootStrapper
    }

};
