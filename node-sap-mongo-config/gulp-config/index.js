'use strict';
var pkg = require('../package.json');
var config = {
    clean: [ 'coverage', 'tmp' ],
    mocha: {
        src: [ 'test/**/*.spec.js'],
        options: {
            slow: 200
        }
    },
    src: [ 'lib/**/*.js', 'index.js' ],
    eslint: [ 'lib/**/*.js', 'index.js', 'test/**/*.js', 'gulpfile.js', 'gulp-config/**/*.js', 'make.js' ]
};

module.exports = config;
