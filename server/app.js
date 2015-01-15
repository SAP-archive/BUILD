var fs = require('fs');

var Server = require('norman-app-server').Server;

var configFile = 'config.json';
if (!fs.existsSync(configFile)) {
    configFile = 'server/config.json'; // debug run
}

Server.start(configFile);
