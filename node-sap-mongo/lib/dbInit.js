'use strict';

var util = require('util');
var singleton = require('node-sap-common').singleton;

var ConnectionManager, db = singleton.get('server.db');

if (!db) {
    ConnectionManager = require('./ConnectionManager');
    var connection = new ConnectionManager();
    db = {
        connection: connection,
        ConnectionManager: ConnectionManager
    };
    util._extend(db, ConnectionManager.Status);
    singleton.register('server.db', db);
}

module.exports = db;
