var pkg = require('../package.json');
var config = {
    clean: [ 'coverage', 'log/**/*' ],
    mocha: [ 'test/**/*.spec.js'],
    src: ['server/**/*.js', 'server/index.js', 'client/index.js'],
};

config.eslint = config.src.concat(config.mocha);

module.exports = config;
