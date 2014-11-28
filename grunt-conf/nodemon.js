'use strict';
module.exports = {

    debug: {
        script: 'server/app.js',
        options: {
            args: [],
            nodeArgs: ['--debug'],
            env: {
                port: process.env.PORT || 9000,
                hostname: '127.0.0.1'
            },

            callback: function (nodemon) {
                nodemon.on('log', function (event) {
                    console.log(event.colour);
                });

                // opens browser on initial server start
                nodemon.on('config:update', function () {
                    // console.log('Debug URL: http://localhost:8080/debug?port=5858');
                });


            }
        }
    }
};
