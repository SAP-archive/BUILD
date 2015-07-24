'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('../exec');
require('node-sap-promise');

var reactor = {};
module.exports = reactor;

reactor.log = {
    writeln: function (message) {
        console.log(message);
    },
    error: function (message) {
        console.error(message);
    }
};

reactor.run = function (projects, done) {
    var k, n, names, defaultTarget;
    names = Object.keys(projects);
    n = names.length;
    k = -1;
    defaultTarget = process.argv[2];
    function runNext() {
        var project, options, target;
        ++k;
        if (k >= n) {
            return true;
        }
        project = names[k];
        options = projects[project];
        if (typeof options !== 'object') {
            options = {};
        }
        target = options.target || defaultTarget;
        return reactor.buildProject(project, target, options.args).then(runNext);
    }
    return runNext().callback(done);
};

reactor.runTarget = function (target, projects, args, done) {
    var runConfig = {};
    if (Array.isArray(target)) {
        done = args;
        args = projects;
        projects = target;
        target = process.argv[2];
    }
    else if (!target) {
        // Empty string
        target = process.argv[2];
    }
    if (typeof args === 'function') {
        done = args;
        args = undefined;
    }
    projects.forEach(function (project) {
        runConfig[project] = {
            target: target,
            args: args
        };
    });
    return reactor.run(runConfig, done);
};

function outputResult(result) {
    if (!result) {
        return;
    }
    if (result.stdout) {
        reactor.log.writeln(result.stdout);
        if (result.stderr) {
            reactor.log.writeln('----------');
        }
    }
    if (result.stderr) {
        reactor.log.writeln(result.stderr);
    }
}

reactor.buildProject = function (project, target, args, done) {
    var cwd = path.resolve(process.cwd(), project);
    var gruntfile = path.join(cwd, 'Gruntfile.js');
    reactor.log.writeln('Building project ' + project);
    if (!fs.existsSync(gruntfile)) {
        reactor.log.writeln('No Gruntfile found in "' + cwd + '", ignoring project');
        return Promise.resolve(false);
    }

    if (typeof args === 'function') {
        done = args;
        args = undefined;
    }
    var command = 'grunt ' + target;
    if (args) {
        command += ' ' + args;
    }

    return exec(command, cwd).then(function (result) {
        reactor.log.writeln(project + '> ' + command + ' completed');
        outputResult(result);
        return (result && result.stdout);
    }, function (err) {
        reactor.log.error(project + '> ' + command + ' failed: ' + err.message);
        reactor.log.error(err.toString());
        outputResult(err);
        throw err;
    }).callback(done);
};
