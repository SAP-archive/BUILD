'use strict';

/**
 * Copy all server dependencies from node_modules to dist/node_modules, excluding devDependencies
 * @return  {array}  flat array of names of required dependencies
 */
function getServerDependencies() {
    var grunt = require('grunt');
    var packageFiles = grunt.file.expand({}, 'node_modules/norman*server/package.json'),
        dependencies = {}, pkg, peers, devs;

    packageFiles.forEach(function (path) {
        pkg = grunt.file.readJSON(path);
        peers = pkg && pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [];
        devs = pkg && pkg.devDependencies ? pkg.devDependencies : [];
        peers.forEach(function (p) {
            if (!devs[p]) dependencies[p + '/**/*.*'] = 1;
        });
    });
    return Object.keys(dependencies);
}

module.exports = {
    html: {
        files: [
            {
                expand: true,
                cwd: 'client',
                dest: 'dev',
                src: ['index.html', 'welcome/*.html']
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.html',
                    '!norman*client/node_modules/**/*.html'
                ]
            }
        ]
    },
    dev: {
        files: [
            {
                expand: true,
                cwd: 'client',
                dest: 'dev',
                src: ['assets/**/*', '*.{ico,txt}', '!**/*.less']
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.{png,gif,jpg,svg}',
                    'norman*client/node_modules/**/*.{png,gif,jpg,svg}',
                    '!norman-openui5/**/*'
                ]
            },

            // bootstrap css
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: ['node_modules/bootstrap/dist/css/bootstrap.css']
                // to copy .map file too; it's confusing in the dev-tools and not useful, as
                // bootstrap css should not be changed only overwritten
                // src: [ 'node_modules/bootstrap/dist/css/bootstrap.css*' ]
            },

            // roboto font
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: [ 'node_modules/norman-common-client/fonts/Roboto/*.*' ]
            }
        ]
    },

    dist: {
        files: [
            {   // CLIENT
                expand: true,
                dot: true,
                cwd: 'dev',
                dest: 'dist/public',
                src: [ '**/*', '!**/*.map' ]
            },
            {   // SERVER
                expand: true,
                dest: 'dist',
                src: [ 'server/**/*.js', 'server/errors/*.html', 'server/log-config.json' ]
            },
            {   // Norman Server Modules
                expand: true,
                cwd: 'node_modules',
                dest: 'dist/node_modules',
                src: ['norman*server/**/*.*']
            },

            {   // Other Dependencies (from norman-*-server)
                expand: true,
                cwd: 'node_modules',
                dest: 'dist/node_modules',
                src: getServerDependencies()
            }

        ]
    }

};
