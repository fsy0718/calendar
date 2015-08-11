var gulp = require('gulp');
var coffee = require('gulp-coffee');
var jsdoc = require('gulp-jsdoc');
var uglify = require('gulp-uglify');


gulp.task('coffee',function(){
  return gulp.src('coffee/*/*.coffee')
    .pipe(coffee({
      bare: true
    }))
    .pipe(gulp.dest('js'));
})