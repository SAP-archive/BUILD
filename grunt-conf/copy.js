'use strict';

var path = require('path');

/**
 * Copy all server dependencies from node_modules to dist/node_modules, excluding devDependencies
 * @return  {array}  flat array of names of required dependencies
 */
function getServerDependencies() {
    var grunt = require('grunt');
    var pkg = grunt.file.readJSON('package.json');
    var directDependencies = Object.keys(pkg.dependencies);
    var dependencies = {};
    var clientRegExp = /norman.*client/;
    directDependencies.forEach(function (dependency) {
        var depPkg, depPath;
        if (clientRegExp.test(dependency)) {
            // ignore client packages
            return;
        }
        console.log('Found server module ' + dependency);
        dependencies[dependency + '/**/*']  = 1;

        depPkg = grunt.file.readJSON('node_modules/' + dependency + '/package.json');

        // add peer dependencies if any
        if (depPkg.peerDependencies) {
            Object.keys(depPkg.peerDependencies).forEach(function (peer) {
                console.log("Found server module " + peer);
                dependencies[peer + '/**/*'] = 1;
            });
        }

        // add dependencies if needed
        if (depPkg.dependencies) {
            Object.keys(depPkg.dependencies).forEach(function (dep) {
                console.log("Found server module " + dep);
                dependencies[dep + '/**/*'] = 1;
            });
        }
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
                    'norman*client/bower_components/**/*.{png,gif,jpg,svg,js,html,css}',
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
                src: ['node_modules/norman-common-client/fonts/Roboto/*.*']
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
                src: ['**/*', '!**/*.map']
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
                src: getServerDependencies()
            }
        ]
    }

};
