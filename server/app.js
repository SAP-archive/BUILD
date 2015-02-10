/*eslint no-process-exit: 0*/
var path = require('path');

var Server = require('norman-app-server').Server;
var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
    if (process.argv[k] === '--create-admin') {
        if (k < n - 2) {
            global.createAdmin = {
                name: process.argv[k + 1],
                email: process.argv[k + 2]
            };
        }
        else {
            console.log('Insufficient create-admin parameters. Please provide name and email.');
            process.exit(1);
        }
    }
}

Server.start(configFile);
