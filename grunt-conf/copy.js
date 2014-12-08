'use strict';

/**
 * Copy all server dependencies from node_modules to dist/node_modules,
 *     excluding devDependencies
 * @return  {array}  flat array of names of required dependencies
 */
function getServerModules () {
    var pkg = require('../node_modules/norman-common-server/package.json'),
        peers = pkg && pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [],
        devs = pkg && pkg.devDependencies, deps = [];
    peers.forEach(function (p) { if (!devs[p]) { deps.push(p + '/**/*.*'); } });
    return deps;
}

module.exports = {
    dev: {
        files: [
            {
                expand: true,
                cwd: 'client',
                dest: 'dev',
                src: [
                    'index.html',
                    'welcome/*.html',
                    'assets/**/*',
                    '*.{ico,txt}',
                    '!**/*.less'
                ]
            },
            {
                expand: true,
                dest: 'dev',
                src: [ 'node_modules/norman*/**/*.{html,png,gif,jpg,svg}' ]
            },


            // bootstrap css
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: [ 'node_modules/bootstrap/dist/css/bootstrap.css' ]
                // to copy .map file too; it's confusing in the dev-tools and not useful, as
                // bootstrap css should not be changed only overwritten
                // src: [ 'node_modules/bootstrap/dist/css/bootstrap.css*' ]
            },


            // font-awesome
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: [ 'node_modules/font-awesome/fonts/*.*' ]
            },
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: [ 'node_modules/font-awesome/css/font-awesome.css' ]
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
                src: [
                    '**/*',
                    '!**/*.map'
                ]
            },
            {   // SERVER
                expand: true,
                dest: 'dist',
                src: [
                    'server/**/*.js'
                ]
            },
            {   // Norman Server Modules
                expand: true,
                cwd: 'node_modules',
                dest: 'dist/node_modules',
                src: [ 'norman*server/**/*.*' ]
            },
            {   // Other Dependencies (from norman-common-server)
                expand: true,
                cwd: 'node_modules',
                dest: 'dist/node_modules',
                src: getServerModules()
            }

        ]
    }

};
