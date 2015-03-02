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
        var registry = require('norman-common-server').registry,
            aclService = registry.getModule('AclService');

        if (!aclService) return console.error('ACL service not found. Please update norman-auth-server');

        // create, assign or unassign admin role
        aclService[cmd + 'Admin'](admin).then(function () {
            console.log('\nAdmin role ' + cmd + 'ed, ' + admin.email + '\n');
        });
    }

});
