'use strict';
module.exports = {
    options: {
        paths: ['client']
    },
    dev: {
        options: {
            compress: false
            // sourceMap: true,
            // outputSourceFiles: false,
            // paths: [ 'less' ],
            // dumpLineNumbers: 'mediaquery'
            // sourceMapFilename: 'dev/assets/style.css.map',
            // sourceMapURL: 'style.css.map'
        },
        files: {
            'dev/assets/style.css': [
                'node_modules/norman-common-client/styles/base.less',
                'client/welcome/*.less',
                'node_modules/norman-*/**/*.less',
                '!node_modules/norman-common-client/styles/*.less',
                '!node_modules/norman-*/node_modules/**/*.less',
                '!node_modules/norman-openui5/**/*.less'
            ]
        }
    }

};
