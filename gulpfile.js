"use strict";
// Project configuration
var project 	    = 'EventManager', // Project name, used for build zip.
    version         = '0.1.0', // Version for stylesheets and scripts
	url 		    = 'localhost:5000' // Local Development URL for BrowserSync. Change as-needed.
;

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    gulp = require('gulp'),
    clean = require('gulp-clean'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    clone = require('gulp-clone'),
    cssnano = require('gulp-cssnano'),
    merge = require('gulp-merge'),
    zip  = require('gulp-zip'),
    wpPot = require('gulp-wp-pot'),
    notify = require('gulp-notify'),
    gulpSequence = require('gulp-sequence')
;

var paths = {
    jsSrc: "js/source/",
    jsDest: "wwwroot/assets/js/",
    cssDest: "wwwroot/assets/css/",
    libSrc: "node_modules/",
    libDest: "wwwroot/assets/lib/",
    bootstrapSrc: "../node_modules/bootstrap/scss/",
    temp: "./temp/"
};

// Cleaners
gulp.task("clean:js", function (cb) {
    rimraf(paths.jsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.CssDest, cb);
});

gulp.task("clean:lib", function (cb) {
    rimraf(paths.libDest, cb);
});

gulp.task("clean:temp", function (cb) {
    rimraf(paths.temp, cb);
});

gulp.task("clean", ["clean:js", "clean:css", "clean:lib", "clean:temp"]);

// Minify javascript
gulp.task("minify:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

// Copy libs to wwwroot/lib folder
gulp.task("copy:lib", () => {
    gulp.src([
        'moment/min/*.js',
        'font-awesome/fonts'
    ], {
        cwd: paths.libSrc + "/**"
    })
        .pipe(gulp.dest(paths.libDest));
});


// gulp sass - Compiles SCSS files in CSS
gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest(paths.cssDest));
});

// gulp make:css - Make both minified and unminified css from scss. 
gulp.task('make:css', function () {
    var source = gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass());

    var pipe1 = source.pipe(clone())
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest(paths.cssDest));

    var pipe2 = source.pipe(clone())
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.cssDest));

    return merge(pipe1, pipe2);
});

// gulp make:js - Uglifies and concat all JS files into one
gulp.task('make:js', function () {
    gulp.src([
        paths.libSrc + 'jquery/dist/jquery.min.js',
        paths.libSrc + 'popper.js/dist/popper.min.js',
        paths.libSrc + 'bootstrap/dist/js/bootstrap.min.js',
        paths.libSrc + 'moment/min/moment.min.js',
        paths.libSrc + 'moment/locale/nb.js'

    ])
        .pipe(concat('site.min.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(paths.jsDest));

    gulp.src([
        paths.libSrc + 'jquery/dist/jquery.js',
        paths.libSrc + 'popper.js/dist/umd/popper.js',
        paths.libSrc + 'bootstrap/dist/js/bootstrap.js',
        paths.libSrc + 'moment/moment.js',
        paths.libSrc + 'moment/locale/nb.js'
    ])
        .pipe(concat('site.js'))
        .pipe(gulp.dest(paths.jsDest));
});

 gulp.task('build', gulpSequence('clean:temp', 'make:css', 'build:pot', 'build:theme', 'build:zip'));