'use strict';
var pkg = require('../package.json');
var config = {
    clean: ['coverage'],
    mocha: [ 'test/**/*.spec.js'],
    src: ['lib/**/*.js', 'index.js', 'bin/worker.js']
};

config.eslint = config.src.concat([ 'test/**/*.js', 'gulp-config/*.js', 'make', 'gulpfile.js' ]);

module.exports = config;
