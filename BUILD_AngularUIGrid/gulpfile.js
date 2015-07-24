'use strict';

var gulp = require('gulp');
var build = require('node-sap-build');

// Workaround for eslint bad object-assign version
Object.assign = require('object-assign');

gulp.task('default', ['build'], function () {
});

gulp.task('clean', function (done) {
});

gulp.task('build', [], function () {
});

gulp.task('dist', ['build'], function () {
});

gulp.task('npm-publish', ['dist', 'publish'], function () {
});


gulp.task('publish', [ 'dist' ], function (done) {
  var packages = ['.'];
  build.npm.publishProjects(packages, done);
});
