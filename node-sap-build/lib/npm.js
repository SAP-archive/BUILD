'use strict';

var path = require('path');
var exec = require('./exec');
require('node-sap-promise');

var npm = {};
module.exports = npm;

npm.install = function (args, done) {
    var command = 'install';
    if (args) {
        command += ' ' + args;
    }
    return npm.run(command, done);
};

npm.link = function (args, done) {
    var command = 'link';
    if (args) {
        command += ' ' + args;
    }
    return npm.run(command, done);
};

npm.publish = function (args, done) {
    var command = 'publish';
    if (args) {
        command += ' ' + args;
    }
    return npm.run(command, done);
};

npm.installPackages = function (packages, done) {
    var k = 0, n = packages.length;
    function nextPackage() {
        var pkg;
        if (k >= n) {
            return Promise.resolve(true).callback(done);
        }
        pkg = packages[k++];
        return npm.install(pkg).then(nextPackage);
    }
    return nextPackage();
};

npm.publishProject = function (project, tag, done) {
    var projectDir = path.resolve(process.cwd(), project);
    if (typeof tag === 'function') {
        done = tag;
        tag = undefined;
    }
    var command = 'publish';
    if (tag) {
        command += ' --tag ' + tag;
    }
    return npm.run(command, projectDir, done);
};

npm.publishProjects = function (projects, tag, done) {
    var k, n;
    if (typeof tag === 'function') {
        done = tag;
        tag = undefined;
    }
    n = projects.length;
    k = 0;
    function nextProject() {
        var project;
        if (k >= n) {
            return Promise.resolve(true);
        }
        project = projects[k++];
        return npm.publishProject(project, tag).then(nextProject);
    }
    return nextProject().callback(done);
};

npm.installProject = function (project, args, done) {
    var projectDir = path.resolve(process.cwd(), project);
    if (typeof args === 'function') {
        done = args;
        args = undefined;
    }
    var command = 'install';
    if (args) {
        command += ' ' + args;
    }
    return npm.run(command, projectDir, done);
};

npm.installProjects = function (projects, args, done) {
    var k, n;
    if (typeof args === 'function') {
        done = args;
        args = undefined;
    }
    n = projects.length;
    k = 0;
    function nextProject() {
        var project;
        if (k >= n) {
            return Promise.resolve(true);
        }
        project = projects[k++];
        return npm.installProject(project, args).then(nextProject);
    }
    return nextProject().callback(done);
};

npm.run = function (command, cwd, done) {
    command = 'npm ' + command;
    if (typeof cwd === 'function') {
        done = cwd;
        cwd = undefined;
    }
    cwd = cwd || process.cwd();
    console.log(cwd + '>' + command);
    return exec(command, { cwd: cwd }).then(function (result) {
        console.log(command + ' completed');
        return result.stdout;
    }, function (err) {
        console.log(command + ' failed: ' + err.message);
        console.log(err.toString());
        throw err;
    }).callback(done);
};
