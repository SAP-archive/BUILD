'use strict';

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
        // ignore client packages
        if (clientRegExp.test(dependency)) return;
        grunt.log.debug('Found server module ' + dependency);
        dependencies[dependency + '/**/*'] = 1;

        var depPkg = grunt.file.readJSON('node_modules/' + dependency + '/package.json');

        // add peer dependencies if any
        if (depPkg.peerDependencies) {
            Object.keys(depPkg.peerDependencies).forEach(function (peer) {
                grunt.log.debug('Found server module ' + peer);
                dependencies[peer + '/**/*'] = 1;
            });
        }

        // add dependencies if needed
        if (depPkg.dependencies) {
            Object.keys(depPkg.dependencies).forEach(function (dep) {
                grunt.log.debug('Found server module ' + dep);
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
                    '!norman-common-client/**/*.html',
                    '!norman*client/node_modules/**/*.html'
                ]
            },
            {
                expand: true,
                cwd: 'node_modules/norman-client-tp/node_modules/',
                dest: 'dev/resources/',
                src: [
                    'angular-sap-*/**/*.html',
                    '!angular-sap-*/node_modules/**/*.html'
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
                src: ['legal/**/*', 'assets/**/*', 'framing_control.js', '*.{ico,txt}', '!**/*.less']
            },
            {
                expand: true,
                cwd: 'node_modules/',
                dest: 'dev/resources/',
                src: [
                    'norman*client/**/*.{pdf,png,gif,jpg,svg,json}',
                    'norman*client/node_modules/**/*.{pdf,png,gif,jpg,svg}',
                    'norman*client/bower_components/**/*.{pdf,png,gif,jpg,svg,js,html,css}',
                    'norman-ng-grid/**/*.{png,gif,jpg,svg,json}',
                    '!norman-openui5/**/*',
                    '!norman-testing-tp-client/**/*',
                    '!node_modules/norman-ui-catalog-manager-server/server/lib/api/catalog/library/**/*.js'
                ]
            },
            {
                expand: true,
                cwd: 'node_modules/norman-client-tp/node_modules',
                dest: 'dev/resources/',
                src: [
                    'angular-sap-*/**/*.{pdf,png,gif,jpg,svg}',
                    'angular-sap-*/node_modules/**/*.{pdf,png,gif,jpg,svg}'
                ]
            },

            //norman-ng-grid(ui-grid) css and fonts
            //fonts should be in the same directory as css. So will be copied to dev/assets folder
            {
                expand: true,
                flatten: true,
                dest: 'dev/assets',
                src: ['node_modules/norman-prototype-editors-client/node_modules/norman-ng-grid/styles/ui-grid.css',
                    'node_modules/norman-prototype-editors-client/node_modules/norman-ng-grid/fonts/*.*']
            },

            // roboto font
            {
                expand: true,
                flatten: true,
                dest: 'dev/fonts',
                src: ['node_modules/norman-client-tp/node_modules/angular-sap-ui-elements/fonts/Roboto/*.*']
            },

            // ui-elements docs css
            {
                expand: true,
                flatten: true,
                dest: 'dev/docs/styles',
                src: ['node_modules/norman-common-client/docs/**/*.css']
            },

            // security
            {
                expand: true,
                cwd: 'node_modules/norman-user-research-client/security',
                dest: 'dev',
                src: ['iframeMessaging.js']
            }
        ]
    },

    dist: {
        files: [
            { // CLIENT
                expand: true,
                dot: true,
                cwd: 'dev',
                dest: 'dist/public',
                src: ['**/*']
            },
            { // SERVER
                expand: true,
                dest: 'dist',
                src: [
                    'server/**/*.js',
                    'server/errors/*.html',
                    'server/config/services.json',
                    'server/config/features.json',
                    'server/config/security.json',
                    'server/config/uicatalog.json',
                    'server/dbinitconfig.json'
                ]
            },
            { // Norman Server Modules
                expand: true,
                cwd: 'node_modules',
                dest: 'dist/node_modules',
                src: getServerDependencies()
            },
            { // Norman package.json
                expand: true,
                dest: 'dist',
                src: ['package.json']
            }
        ]
    }

};
