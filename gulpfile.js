var makeBinary = true;

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    gp_minify_css = require('gulp-minify-css');

var jsSrc = [
  './src/_dg_quick_tabs.js',
  './src/includes/include.*.js',
  './src/widgets/widget.*.js'
];

// Minify JavaScript
function minifyJs() {
  console.log('compressing dg_quick_tabs.js...');
  var js = gulp.src(jsSrc)
    .pipe(gp_concat('dg_quick_tabs.js'))
    .pipe(gulp.dest('./'));
  if (makeBinary) {
    console.log('compressing dg_quick_tabs.min.js...');
    return js.pipe(gp_rename('dg_quick_tabs.min.js'))
    .pipe(gp_uglify())
    .pipe(gulp.dest('./'));
  }
  return js;
}
gulp.task(minifyJs);

var cssSrc = [
  './css/*.css'
];

// Minify CSS
function minifyCss() {
  console.log('compressing dg_quick_tabs.css...');
  var css = gulp.src(cssSrc)
    .pipe(gp_concat('dg_quick_tabs.css'))
    .pipe(gulp.dest('./'));
  if (makeBinary) {
    console.log('compressing dg_quick_tabs.min.css...');
    return css.pipe(gp_rename('dg_quick_tabs.min.css'))
    .pipe(gp_minify_css())
    .pipe(gulp.dest('./'));
  }
  return css;
}
gulp.task(minifyCss);

gulp.task('default', function(done) {

  gulp.watch(jsSrc, gulp.series('minifyJs'));
  gulp.watch(cssSrc, gulp.series('minifyCss'));

  done();

});
