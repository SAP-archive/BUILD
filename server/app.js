var fs = require('fs');

var Server = require('norman-app-server').Server;

var configFile = 'config.json';
if (!fs.existsSync(configFile)) {
    configFile = 'server/config.json'; // debug run
}

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === "--config") && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

Server.start(configFile);
