'use strict';
module.exports = {

    debug: {
        script: 'server/app.js',
        options: {
            nodeArgs: ['--debug-brk'],
            env: { PORT: process.env.PORT || 9000 },

            callback: function (nodemon) {
                nodemon.on('log', function (event) {
                    console.log(event.colour);
                });

                // opens browser on initial server start
                nodemon.on('config:update', function () {
                    console.log('Debug URL: http://localhost:8080/debug?port=5858');
                });


            }
        }
    }
};
