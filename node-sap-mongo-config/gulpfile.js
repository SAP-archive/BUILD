'use strict';
var gulp = require('gulp');
var build = require('node-sap-build');
var config = require('./gulp-config');


gulp.task('default', [ 'build' ], function () {
});

gulp.task('clean', function (done) {
    var del = require('del');
    del(config.clean, function (err) {
        done(err);
    });
});

gulp.task('build', [ 'clean', 'eslint', 'coverage' ], function () {
});

gulp.task('dist', [ 'build' ], function () {
});

gulp.task('doc', [ 'mddoc' ], function () {
});

gulp.task('eslint', function () {
    var eslint = require('gulp-eslint');
    return gulp.src(config.eslint)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('test', [ 'mocha' ], function () {
});

gulp.task('mocha', function () {
    return gulp.src(config.mocha.src, { read: false })
        .pipe(require('gulp-mocha')(config.mocha.options));
});

gulp.task('coverage', [ 'mocha-istanbul' ], function () {
});

gulp.task('mocha-istanbul', [ 'clean' ], function (done) {
    var mocha = require('gulp-mocha');
    var istanbul = require('gulp-istanbul');
    gulp.src(config.src)
        .pipe(istanbul()) // Covering files
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function () {
            gulp.src(config.mocha.src, { read: false })
                .pipe(mocha(config.mocha.options))
                .pipe(istanbul.writeReports({})) // Creating the reports after tests ran
                .on('end', done);
        });
});

gulp.task('mddoc', [ 'eslint' ], function () {
    var gutil = require('gulp-util');
    var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
    var concat = require('gulp-concat');

    return gulp.src(config.src)
        .pipe(concat('API.md'))
        .pipe(gulpJsdoc2md())
        .on('error', function (err) {
            gutil.log('jsdoc2md failed:', err.message);
        })
        .pipe(gulp.dest(''));
});
