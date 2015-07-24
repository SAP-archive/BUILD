'use strict';
module.exports = {
    dev: {
        script: 'server/app.js',
        options: {
            nodeArgs: ['--debug'],
            env: {
                PORT: process.env.PORT || 9000
            },
            callback: function (nodemon) {
                nodemon.on('log', function (event) {
                    console.log(event.colour);
                });
            }
        }
    },
    debug: {
        script: 'server/admin-server/app.js',
        options: {
            watch: ['server'],
            nodeArgs: ['--debug-brk'],
            ignore: ['node_modules/**', '.git/', 'Gruntfile.js'],
            env: {
                PORT: process.env.PORT || 9000
            },
            callback: function (nodemon) {
                nodemon.on('log', function (event) {
                    console.log(event.colour);
                });

                // opens browser on initial server start
                nodemon.on('config:update', function () {
                    setTimeout(function () {
                        require('open')('http://localhost:8080/debug?port=5858');
                    }, 500);
                });
            }
        }
    }
};
