'use strict';

var spawn = require('child_process').spawn;
var util = require('util');
require('node-sap-promise');

var spawned = 0;
var MAX_SPAWN = 20;

function programExec(program, args, options) {
    var err, timeoutId;
    var stdout = '', stderr = '', killed = false, exited = false;
    var deferred = Promise.defer();
    var child;
    if (++spawned <= MAX_SPAWN) {
        child = spawn(program, args, {
            cwd: options.cwd,
            env: options.env,
            windowsVerbatimArguments: !!options.windowsVerbatimArguments
        });
    }
    else {
        return Promise.reject(new Error('Too many spawned programs'));
    }

    function onExit(code, signal) {
        if (exited) {
            return;
        }
        exited = true;
        --spawned;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        if (err) {
            err.stdout = stdout;
            err.stderr = stderr;
            deferred.reject(err);
        }
        else if ((code === 0) && (signal === null)) {
            deferred.resolve({
                stdout: stdout,
                stderr: stderr
            });
        }
        else {
            var e = new Error('Command failed');
            e.killed = child.killed || killed;
            e.code = code;
            e.signal = signal;
            e.stdout = stdout;
            e.stderr = stderr;
            deferred.reject(e);
        }
    }

    function onError(e) {
        err = e;
        child.stdout.destroy();
        child.stderr.destroy();
        onExit();
    }

    function kill() {
        child.stdout.destroy();
        child.stderr.destroy();
        killed = true;
        try {
            child.kill(options.killSignal);
        }
        catch (e) {
            err = e;
            onExit();
        }
    }

    if (options.timeout && (options.timeout > 0)) {
        timeoutId = setTimeout(function () {
            kill();
            timeoutId = null;
        }, options.timeout);
    }

    child.stdout.addListener('data', function (chunk) {
        if (options.stdio === 'inherit') {
            process.stdout.write(chunk);
        }
        stdout += chunk.toString(options.encoding);
        if (stdout.length > options.maxBuffer) {
            err = new Error('stdout maxBuffer exceeded.');
            kill();
        }
    });
    child.stderr.addListener('data', function (chunk) {
        if (options.stdio === 'inherit') {
            process.stderr.write(chunk);
        }
        stderr += chunk.toString(options.encoding);
        if (stderr.length > options.maxBuffer) {
            err = new Error('stderr maxBuffer exceeded.');
            kill();
        }
    });

    child.addListener('close', onExit);
    child.addListener('error', onError);

    return deferred.promise;
}

/**
 * Improved version of exec
 * @param command
 * @param options
 * @param callback
 */
function exec(command, options, done) {
    var program, args;
    var execOptions = {
        encoding: 'utf8',
        timeout: 0,
        maxBuffer: 500 * 1024,
        killSignal: 'SIGTERM',
        stdio: 'inherit'
    };

    if (typeof options === 'function') {
        done = options;
        options = undefined;
    }
    if (typeof options === 'string') {
        options = { cwd: options };
    }

    execOptions = util._extend(execOptions, options);
    if (process.platform === 'win32') {
        program = 'cmd.exe';
        args = ['/s', '/c', '"' + command + '"'];
        // Make a shallow copy before patching so we don't clobber the user's
        // options object.
        execOptions.windowsVerbatimArguments = true;
    }
    else {
        program = '/bin/sh';
        args = ['-c', command];
    }
    return programExec(program, args, execOptions).callback(done);
}

module.exports = exec;
