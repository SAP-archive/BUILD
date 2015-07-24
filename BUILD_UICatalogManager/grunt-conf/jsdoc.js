'use strict';
module.exports = {
    dist : {
        src: ['{client,server}/**/*.js','!server/lib/api/catalog/library/**/*.js'],
        options: {
            destination: 'doc'
        }
    }
};
