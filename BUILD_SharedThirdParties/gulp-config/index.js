var pkg = require('../package.json');
var config = {
  clean: [ 'coverage', 'log/**/*' ],
  mocha: [ 'test/*.js'],
  src: ['server/**/*.js', 'server/index.js', 'client/index.js']
};

config.eslint = config.src;

module.exports = config;
