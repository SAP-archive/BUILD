/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var Server = require('norman-app-server').Server;
var configFile = path.join(__dirname, 'config.json');

var k, n, admin = null, cmd;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
    if (process.argv[k] === '--create-admin') {
        if (k < n - 2) {
            cmd = 'create';
            admin = {
                name: process.argv[k + 1],
                email: process.argv[k + 2],
                password: process.argv[k + 3] || null
            };
        }
        else {
            console.log('Insufficient --create-admin parameters. Please provide name and email.');
            process.exit(1);
        }
    }
    if (process.argv[k] === '--unassign-admin') {
        if (k < n - 1) {
            cmd = 'unassign';
            admin = { email: process.argv[k + 1] };
        }
        else {
            console.log('Insufficient --unassign-admin parameters. Please provide email.');
            process.exit(1);
        }
    }
}

Server.start(configFile).then(function () {

    // Create Admin user (required for Admin section)
    if (admin) {
        var auth = require('norman-auth-server'),
            msg = function (err, success) {
                if (err) {
                    if (err.errors && err.errors.email) err = err.errors.email.message;
                    return console.error('\nERROR: ' + err + '\n');
                }
                console.log('\n' + success + '\n');
            };

        // create or assign admin role
        if (cmd === 'create') {
            if (auth.createAdmin) auth.createAdmin(admin, function (err, created) {
                msg(err, created ? 'Admin created!' : 'Admin role assigned to: ' + admin.email);
            });
        }
        else if (cmd === 'unassign') {
            if (auth.unassignAdmin) auth.unassignAdmin(admin, function (err) {
                msg(err, 'Admin role unassigned!');
            });
        }
    }
});
