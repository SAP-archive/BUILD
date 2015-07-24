'use strict';

// Dev specific configuration
// ===========================
var db;

if (process.env.NODE_ENV === 'test') {
    db = 'norman-ui-catalog-manager-test';
}
else {
    db = 'norman-ui-catalog-manager';
}


module.exports = {
    db: db,
    mongo: {
        uri: 'mongodb://localhost/' + db,
        options: {
            db: {
                safe: true
            }
        }
    },
    normanCatalogTemplate: {
        uri: 'mongodb://localhost/norman-template',
        options: {
            db: {
                safe: true
            }
        }
    }
};
