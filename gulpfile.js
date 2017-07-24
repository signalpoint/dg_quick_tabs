var gulp = require('gulp'),
    watch = require('gulp-watch'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css');

var dgQuickTabsModuleSrc = [
  './src/_dg_quick_tabs.js',
  './src/widgets/widget.*.js'
];

var dgQuickTabsCssSrc = ['./css/*.css'];

// Task to build the dg_curtain.min.js file.
gulp.task('minifyJS', function(){
  return gulp.src(dgQuickTabsModuleSrc)
      .pipe(gp_concat('concat.js'))
      .pipe(gulp.dest(''))
      .pipe(gp_rename('dg_quick_tabs.min.js'))
      .pipe(gp_uglify())
      .pipe(gulp.dest(''));
});

// Task to build the dg_curtain.min.css file.
gulp.task('minifyCSS', function(){
  gulp.src(dgQuickTabsCssSrc)
      .pipe(gp_concat('concat.css'))
      .pipe(gulp.dest(''))
      .pipe(gp_rename('dg_quick_tabs.min.css'))
      .pipe(minifyCSS())
      .pipe(gulp.dest(''));
});

gulp.task('default', function () {
  watch(dgQuickTabsModuleSrc, function(event) { gulp.start('minifyJS') });
  watch(dgQuickTabsCssSrc, function(event) { gulp.start('minifyCSS') });
  gulp.start(['minifyJS', 'minifyCSS']);
});
