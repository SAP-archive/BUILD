/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var Server = require('node-sap-app-server').Server;
var configFile = path.join(__dirname, 'config.json');

Server.start(configFile);
