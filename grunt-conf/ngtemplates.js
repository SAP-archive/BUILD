'use strict';
module.exports = {
    options: {

        // This should be the name of your apps angular module
        module: 'normanGeneratorTestsApp',

        htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        },
    },
    main: {
        src: 'client/{app,components,modules}/**/*.html',
        dest: '.tmp/templates.js'
    }

};
