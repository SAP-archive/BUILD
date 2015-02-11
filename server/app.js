/*eslint no-process-exit: 0*/
var path = require('path');
var Server = require('norman-app-server').Server;
var configFile = path.join(__dirname, 'config.json');

var k, n, admin = null;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
    if (process.argv[k] === '--create-admin') {
        if (k < n - 2) {
            admin = {
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

Server.start(configFile).then(function () {
    // Create Admin user (required for Admin section)
    if (admin) {
        require('norman-auth-server').createAdmin(admin, function (err) {
            if (err) throw err;
            console.log('Admin created!');
        });
    }
});
