'use strict';
module.exports = {

    dev: {
        options: {
            transform: [['browserify-istanbul', {defaultIgnore: false, ignore : ['**/node_modules/angular*/**', '**/test/**', '**/tests/**', '**/*.json']}]]
        },
        files: {
            'dev/assets/bundle.js': ['node_modules/norman-business-catalog-manager-test/client.js', 'node_modules/norman-business-catalog-manager-client/index.js']
        }

    }

};
