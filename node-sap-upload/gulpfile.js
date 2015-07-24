'use strict';
var exec = require('child_process').exec;
var gulp = require('gulp');
var config = require('./gulp-config');
var helper = {
    plugins: {},
    getPlugin: function (name) {
        var plugin = this.plugins[name];
        if (!plugin) {
            plugin = require(name);
            this.plugins[name] = plugin;
        }
        return plugin;
    }
};

gulp.task('default', ['build'], function () {
});

gulp.task('clean', function (done) {
    var del = helper.getPlugin('del');
    del(config.clean, function (err) {
        done(err);
    });
});

gulp.task('build', ['clean', 'eslint', 'coverage'], function () {
});

gulp.task('dist', ['build'], function () {
});

gulp.task('doc', ['mddoc'], function () {
});

gulp.task('eslint', function () {
    var eslint = helper.getPlugin('gulp-eslint');
    return gulp.src(config.eslint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', [ 'mocha' ], function () {
});

gulp.task('mocha', function () {
    return gulp.src(config.mocha, { read: false })
        .pipe(helper.getPlugin('gulp-mocha')({ slow: 200 }));
});

gulp.task('coverage', [ 'mocha-istanbul' ], function () {
});

gulp.task('mocha-istanbul', [ 'clean' ], function (done) {
    var mocha = helper.getPlugin('gulp-mocha');
    var istanbul = helper.getPlugin('gulp-istanbul');
    gulp.src(config.src)
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(config.mocha, { read: false })
                .pipe(mocha({ slow: 200 }))
                .pipe(istanbul.writeReports({})) // Creating the reports after tests ran
                .on('end', done);
        });
});

gulp.task('mddoc', [ 'eslint' ], function () {
    var gutil = helper.getPlugin('gulp-util');
    var gulpJsdoc2md = helper.getPlugin('gulp-jsdoc-to-markdown');
    var concat = helper.getPlugin('gulp-concat');

    return gulp.src(config.src)
        .pipe(concat('API.md'))
        .pipe(gulpJsdoc2md())
        .on('error', function (err) {
            gutil.log('jsdoc2md failed:', err.message);
        })
        .pipe(gulp.dest(''));
});
