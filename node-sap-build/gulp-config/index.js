var config = {
    clean: [ 'coverage' ],
    mocha: [ 'test/**/*.spec.js'],
    src: ['lib/**/*.js', 'index.js']
};

config.eslint = config.src.concat([ 'test/**/*.js', 'make.js', 'gulpfile.js' ]);

module.exports = config;
