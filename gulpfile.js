var gulp = require('gulp');
var coffee = require('gulp-coffee');
var jsdoc = require('gulp-jsdoc');
var uglify = require('gulp-uglify');
var sass = require('gulp-ruby-sass');


gulp.task('coffee',function(){
  return gulp.src('coffee/*/*.coffee')
    .pipe(coffee({
      bare: true
    }))
    .pipe(gulp.dest('js'));
})

gulp.task('sass',function(){
  return sass('sass')
    .on('error',function(err){
      console.error('Error!',err.message);
    })
    .pipe(gulp.dest('css'))

})


gulp.task('jsdoc',['coffee'],function(){
  return gulp.src(['./js/fCalendar/*.js'])
    .pipe(jsdoc.parser())
    .pipe(jsdoc.generator('doc',{
      path: 'node_modules/jaguarjs-jsdoc'

      },{
      'private': true,
      monospaceLinks: true,
      cleverLinks: true,
      outputSourceFiles: true
    }))
})