'use strict';

// Dev specific configuration
// ===========================

var db;

if (process.env.NODE_ENV === 'test') {
    db = 'norman-previewer-test';
}
else {
    db = 'norman-previewer';
}

module.exports = {
    mongo: {
        uri: 'mongodb://localhost/' + db,
        options: {
            db: {
                safe: true
            }
        }
    }
};
