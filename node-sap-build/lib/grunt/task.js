'use strict';

var fs = require('fs');
var path = require('path');

var contextGrunt;

var gruntTask = {};
module.exports = gruntTask;

gruntTask.setGrunt = function (grunt) {
    contextGrunt = grunt;
};

gruntTask.loadTasks = function (name) {
    if (!contextGrunt) {
        throw new Error('Grunt instance has not been set');
    }
    var taskDir = gruntTask.getTaskDir(name);
    if (taskDir) {
        contextGrunt.loadTasks(taskDir);
    }
};

gruntTask.getTaskDir = function (name) {
    var taskDir, base = gruntTask.findModuleBase(name);
    if (base) {
        taskDir = path.join(base, 'tasks');
        if (fs.existsSync(taskDir)) {
            return taskDir;
        }
    }
    return null;
};

function baseFromModule(modulePath) {
    var found, prev, current = path.dirname(modulePath);
    while (current !== prev) {
        if (fs.existsSync(path.join(current, 'package.json'))) {
            found = true;
            break;
        }
        prev = current;
        current = path.dirname(current);
    }
    return (found ? current : null);
}

function baseFromName(name) {
    var base, prev, current = process.cwd();
    while (current !== prev) {
        base = path.join(current, 'node_modules', name);
        if (fs.existsSync(base)) {
            return base;
        }
        prev = current;
        current = path.dirname(current);
    }
    return null;
}

gruntTask.findModuleBase = function (name) {
    var modulePath;
    try {
        modulePath = require.resolve(name);
        modulePath = baseFromModule(modulePath);
    }
    catch(error) {
        // Typically grunt plugins tend to be invalid npm modules ^_^
    }

    if (!modulePath) {
        modulePath = baseFromName(name);
    }
    return modulePath;
};
