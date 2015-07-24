

//var remote = "origin/master";

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.initConfig({
        // vars
        bump: require('./grunt-conf/bump'),
        env: {
            dev: { NODE_ENV: 'development' },
            prod: { NODE_ENV: 'production' },
            test: { NODE_ENV: 'test' },
            jenkins: { NODE_ENV: 'jenkins' },
            client: 'sample/client',
            server: 'sample/server'
        },
        pkg: grunt.file.readJSON('package.json'),
        // Empties folders to start fresh
        clean: require('./grunt-conf/clean.js'),
        // convert svg images to sprite
        svg_sprite: require('./grunt-conf/svg-sprite.js'),
        
        // Make sure code styles are up to par and there are no obvious mistakes
        eslint: require('./grunt-conf/eslint.js'),
        replace: require('./grunt-conf/sprite-text-replace.js'),
        file_append: require('./grunt-conf/svg-file-append.js'),
        svgmin: require('./grunt-conf/svg-min.js')
    });


    grunt.registerTask('default', [ 'build' ]);
    grunt.registerTask('dist', [ 'build' ]);
    grunt.registerTask('test', function () {

    });

    grunt.registerTask('build', function (target) {
        target = target || 'dev';
        var tasks = [
            'eslint:client',
            //'clean:' + target,
            //'svg-sprite',
        ];

        return grunt.task.run(tasks);
    });

    grunt.registerTask('dev', [ 'build:dev']);
    grunt.registerTask('svg-sprite', [ 'clean:svg', 'svg_sprite', 'svgmin', 'replace', 'file_append']);
};
