var pkg = require('../package.json');
var config = {
    mocha: [ 'test/*.js'],
    src: ['common-directives/**/*.js']
};

config.eslint = config.src;

module.exports = config;