var fs = require('fs');

var Server = require('norman-app-server').Server;

var configFile = 'config.json';
if (!fs.existsSync(configFile)) {
    configFile = 'server/config.json'; // debug run
}

var server = new Server();
server.configure(configFile);
server.initialize()// Connect to Mongo, create Express app and load services
    .then(function () {
        // At this stage you may still add things to the Express app through server.app
    })
    .then(function () {
        return server.start(); // Mount not found handlers and start http server
    })
    .catch(function (err) {

    });
