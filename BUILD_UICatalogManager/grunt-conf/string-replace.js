module.exports = {
    UICatalog: {
        files: {
            'client/styles/sprite.less': 'client/styles/sprite.less'
        },
        options: {
            replacements: [{
                pattern: 'background: url(../assets/',
                replacement: 'background: url(\'../resources/norman-ui-catalog-manager-client/assets/'
            }, {
                pattern: '.svg)',
                replacement: '.svg\')'
            }, {
                pattern: /svg-common/g,
                replacement: 'svg-uicatalog'
            }]
        }
    }
}
