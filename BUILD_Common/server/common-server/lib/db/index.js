'use strict';

var db = require('norman-server-tp')['node-sap-mongo'];
var logging = require('../logging');
var serviceLogger = logging.createLogger('common-mongo');
logging.addWatch(serviceLogger);

db.ConnectionManager.setLogger(serviceLogger);

module.exports = db;
