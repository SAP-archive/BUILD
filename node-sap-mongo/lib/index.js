'use strict';

var db = require('./dbInit');
if (!db.mongoose) {
    db.mongoose = require('./mongoose');
}

module.exports = db;
