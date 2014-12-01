'use strict';
module.exports = {
    unit: {
        options: {
            files: ['client/**/*spec.js', 'server/**/*spec.js', 'e2e/**/*spec.js']
        },
        configFile: 'karma.conf.js',
        singleRun: true
    }
};
