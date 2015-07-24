module.exports = function (grunt) {
    grunt.initConfig({
        eslint: require("./build/grunt-eslint"),
        mochaTest: require("./build/grunt-mocha")
    });

    grunt.registerTask("default", [ "build" ]);
    grunt.registerTask("build", [ "eslint", "test" ]);

    grunt.registerTask("test", [ "mochaTest" ]);
};
