'use strict';

var grunt = require('./lib/grunt');

module.exports = {
    exec: require('./lib/exec'),
    grunt: grunt,
    npm: require('./lib/npm'),
    setGrunt: grunt.setGrunt
};
