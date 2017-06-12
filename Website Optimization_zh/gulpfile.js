var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var imagemin = require('gulp-imagemin');
var inlineCss = require('gulp-inline-css');


var paths = {
  scripts: ['src/js/*.js', 'src/views/js/*.js'],
  images: ['src/img/*', 'src/views/images/*'],
  css: ['src/css/*.css', 'src/views/css/*.css'],
  html: ['src/*.html', 'src/views/*.html']
};

gulp.task('clean', function() {
  return del.sync(['dist']);
});

gulp.task('compress', function(cb) {
  pump([
      gulp.src(paths.scripts, { base: './src' }),
      uglify(),
      gulp.dest('dist')
    ],
    cb
  );
});


gulp.task('minify', function() {
  return gulp.src(paths.html, { base: './src' })
    .pipe(inlineCss({applyLinkTags:false}))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function() {
  return gulp.src(paths.css, { base: './src' })
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist'));
});


gulp.task('minify-img', function() {
  return gulp.src(paths.images, { base: './src' })
    .pipe(imagemin())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean', 'compress', 'minify', 'minify-css', 'minify-img']);