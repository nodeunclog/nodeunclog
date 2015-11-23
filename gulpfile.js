require('unclog')('p');
process.title = cwd.split(/[\/\\]+/g).slice(2).reverse().join(' ') + ' - Gulp';
const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const replace = require('gulp-replace');
const changed = require('gulp-changed-in-place');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('clean', done =>
    del('lib/**/*', done));

gulp.task('babel', done =>
    gulp.src('src/**/*.js')
    .pipe(changed({firstPass: true}))
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015', 'stage-0'],
        retainLines: 'true',
    }))
    .pipe(replace(/(\/\/ )?["']use strict['"];?([\n\r]+)?/g, ''))
    .pipe(sourcemaps.write('.', {sourceRoot: 'src'}))
    .pipe(gulp.dest('lib')));

gulp.task('build', gulp.series('babel'));

gulp.task('watch', done =>
    gulp.watch('src/**/*.es6', gulp.series('babel')));

gulp.task('default', gulp.series('clean', 'build', 'watch'));
