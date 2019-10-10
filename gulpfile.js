const gulp = require("gulp");
const babel = require("gulp-babel");
const gulpCopy = require('gulp-copy');

gulp.task("babel-node", () => {
  return gulp
    .src('./src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
})

gulp.task('gulpCopy', () => {
  return gulp
    .src(['./config/*', './models/*'])
    .pipe(gulpCopy('dist/'))
    .pipe(gulp.dest('dist'))
})

gulp.task('watch',()=>{
  return gulp.watch(['./src/**/*.js','./models/*','./config/*'], gulp.series('babel-node','gulpCopy'))
})