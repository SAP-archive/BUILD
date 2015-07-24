'use strict';
var pkg = require('../package.json');
var config = {
    clean: [  'coverage', 'log/**/*' ],
    mocha: [ 'test/**/*.spec.js'],
    src: ['server/**/*.js', 'server/index.js', 'client/**/*.js', 'client/index.js']
};

config.eslint = config.src.concat([ 'test/**/*.js', 'gulp-config/*.js', 'gulpfile.js', 'make' ]);

module.exports = config;
