"use strict";

const gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    clean = require('gulp-clean'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    clone = require('gulp-clone'),
    cssnano = require('gulp-cssnano'),
    merge = require('gulp-merge')
;

const paths = {
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

    gulp.src([paths.libSrc + 'bootstrap-table/dist/bootstrap-table.min.css'])
        .pipe(concat('bootstrap-table.min.css'))
        .pipe(gulp.dest(paths.cssDest));

    return merge(pipe1, pipe2);


});

// gulp make:js - Uglifies and concat all JS files into one
gulp.task('make:js', function () {

    // Minified files for production
    gulp.src([
        paths.libSrc + 'jquery/dist/jquery.min.js',
        paths.libSrc + 'popper.js/dist/umd/popper.min.js',
        paths.libSrc + 'bootstrap/dist/js/bootstrap.min.js',
        paths.libSrc + 'bootstrap-3-typeahead/bootstrap3-typeahead.min.js',
        paths.libSrc + 'toastr/toastr.js',
        './js/admin.js',
        './js/sortable.js'
    ])
        .pipe(concat('site.min.js'))
        .pipe(gulp.dest(paths.jsDest));

    // Full files for development
    gulp.src([
        paths.libSrc + 'jquery/dist/jquery.js',
        paths.libSrc + 'popper.js/dist/umd/popper.js',
        paths.libSrc + 'bootstrap/dist/js/bootstrap.js',
        paths.libSrc + 'bootstrap-3-typeahead/bootstrap3-typeahead.js',
        paths.libSrc + 'toastr/toastr.js',
        './js/admin.js',
        './js/sortable.js'
    ])
        .pipe(concat('site.js'))
        .pipe(gulp.dest(paths.jsDest));

    // Bootstrap table Javascript
    gulp.src([
        paths.libSrc + 'bootstrap-table/dist/bootstrap-table.min.js',
        paths.libSrc + 'bootstrap-table/extensions/toolbar/bootstrap-table-toolbar.min.js',
        paths.libSrc + 'bootstrap-table/extensions/filter/bootstrap-table-filter.min.js',
        paths.libSrc + 'bootstrap-table/extensions/filter-control/bootstrap-table-filter-control.min.js',
        paths.libSrc + 'tableexport.jquery.plugin/tableExport.js',
        paths.libSrc + 'bootstrap-table/src/extensions/export/bootstrap-table-export.js',
        paths.libSrc + 'bootstrap-table/dist/locale/bootstrap-table-nb-NO.min.js'
        ])
        .pipe(concat('bootstrap-table.min.js'))
        .pipe(gulp.dest(paths.jsDest));
});

// The default gulp task
// Run "gulp" to invoke this
gulp.task('default', ['copy:lib', 'make:css', 'make:js']);
