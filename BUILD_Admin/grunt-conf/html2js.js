'use strict';

module.exports = {
    options: {
        base: 'dev/',
        quoteChar: '\'',
        indentString: '    ',
        htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeAttributeQuotes: false,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeOptionalTags: true,
            minifyCSS: true,
            minifyJS: true,
            maxLineLength: 30000
        }
    },
    main: {
        dest: 'dev/assets/templates.js',
        src: [
            'dev/resources/**/*.html',
            '!dev/resources/norman-client-tp/node_modules/angular-sap-ui-elements/index.html'
        ]
    }
};
