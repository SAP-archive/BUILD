'use strict';

module.exports = {
    options: {
        base: 'dev/',
        quoteChar: '\'',
        indentString: '    ',
        htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            // conservativeCollapse: true,
            removeAttributeQuotes: true,
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
            'welcome/*.html',
            'dev/resources/**/*.html',
            '!dev/resources/norman-common-client/ui-elements/index.html'
        ]
    }
};
