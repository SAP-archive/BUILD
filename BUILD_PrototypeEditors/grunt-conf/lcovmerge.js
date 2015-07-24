'use strict';
module.exports = {
    client: {
        options: {
            outputFile: 'reports/coverage/client/lcov.info'
        },
        src: ['reports/coverage/clientTmp/**/*.info']
    },
    server: {
        options: {
            outputFile: 'reports/coverage/server/lcov.info'
        },
        src: ['reports/coverage/server/**/*.info', 'reports/coverage/integration/**/*.info', '!reports/coverage/server/lcov.info']
    }
};
