'use strict';

var gulp = require('gulp');
var config = require('./gulp-config');
var build = require('node-sap-build');
var header = require('gulp-header');

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

gulp.task('build', ['eslint', 'svg-sprite'], function () {
});

gulp.task('replace-svg', ['minify-svg'], function () {
    var svgReplace = helper.getPlugin('gulp-replace');
    return gulp.src(['sprite.less'])
        .pipe(svgReplace('background: url(assets/', 'background: url(\'@{client-assets-dir}/'))
        .pipe(svgReplace('.svg)', '.svg\')'))
        .pipe(header('@import (reference) \'variables\';\n\n'))
        .pipe(gulp.dest('styles/'));
});

gulp.task('clean-svg', ['replace-svg'], function (done) {
    var del = helper.getPlugin('del');
    del(['sprite.less'], function (err) {
        done(err);
    });
});

gulp.task('del-existing-svg', function(done) {
    var del = helper.getPlugin('del');
    del(['assets/angular-sap-ui-elements*.svg'], function (err) {
        done(err);
    });
});

gulp.task('create-svg', ['del-existing-svg'], function () {
    var svgSprite = helper.getPlugin('gulp-svg-sprite');
    return gulp.src('assets/*.svg', {cwd: '.'})
        .pipe(svgSprite({
            mode: {
                css: {
                    sprite: 'assets/angular-sap-ui-elements.svg',
                    bust: true,
                    render: {
                        less: true
                    },
                    dest: '.',
                    prefix: '.common-'
                },
                shape: {
                    spacing: {
                        padding: 1,
                        box: 'content'
                    }
                }
            }
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('minify-svg', ['create-svg'], function () {
    var svgMin = helper.getPlugin('gulp-svgmin');
    return gulp.src('assets/angular-sap-ui-elements*.svg')
        .pipe(svgMin({
            plugins: [{
                removeUselessStrokeAndFill: false
            }, {
                removeComments: true,
                removeTitle: true
            }]
        }))
        .pipe(gulp.dest('assets'));
});

gulp.task('svg-sprite', ['del-existing-svg', 'create-svg', 'minify-svg', 'replace-svg', 'clean-svg'], function () {

});

gulp.task('eslint', function () {
    var eslint = helper.getPlugin('gulp-eslint');
    return gulp.src(['index.js', 'gulpfile.js', 'make', 'ui-elements/**/*.js', 'common-utils/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

gulp.task('dist', [ 'build' ], function () {
});
