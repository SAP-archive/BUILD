'use strict';
var task = require('./task');
var reactor = require('./reactor');

var grunt = {
    loadTasks: task.loadTasks,
    reactor: reactor,
    setGrunt: task.setGrunt,
    task: task
};

module.exports = grunt;
