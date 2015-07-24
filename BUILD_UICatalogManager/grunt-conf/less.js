'use strict';
module.exports = {
    options: {
        paths: [ 'client' ]
    },
    dev: {
        options: { compress: false },
        files: {
            'dev/assets/style.css': [

                '<%= env.client %>/*.less',
                '<%= env.client %>/assets/*.less',
                '<%= env.client %>/welcome/*.less',

                'client/**/*.less',
                '!client/**/node_modules/**/*.less',

                'node_modules/norman-*/**/*.less',

                '!node_modules/norman-common-client/**/*.less',
                'node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/styles/base.less',

                '!node_modules/norman-*/node_modules/**/*.less',
                '!node_modules/norman-openui5/**/*.less',

                'node_modules/norman-client-tp/node_modules/angular-sap-*/**/*.less',
                '!node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/node_modules/**/*.less'
            ]
        }
    }
};
