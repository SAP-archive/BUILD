'use strict';

var path = require('path');
var spawn = require('child_process').spawn;

function getGulpBin() {
    var gulpIndex = require.resolve('gulp');
    return path.join(path.dirname(gulpIndex), 'bin/gulp.js');
}

function run() {
    var command = process.execPath;
    var args = [ getGulpBin() ];
    if (process.argv.length > 2) {
        args = args.concat(process.argv.slice(2));
    }

    var options = {
        cwd: __dirname,
        stdio: 'inherit'
    };

    var child = spawn(command, args, options);
    child.on('error', function (err) {
        console.error('Failed to launch Gulp: ' + err.message); // eslint-disable-line no-console
    });
}

try {
    run();
}
catch (err) {
    console.error('Failed to launch Gulp: ' + err.message); // eslint-disable-line no-console
}
