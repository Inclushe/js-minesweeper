var gulp = require('gulp')
var sass = require('gulp-sass')
var bs = require('browser-sync')
var files = {
  html: 'src/**/*.html',
  css: 'src/css',
  sass: 'src/sass/**/*.sass',
  js: 'src/js/**/*.js',
  serv: './src'
}

gulp.task('default', ['sass'], function () {
  bs.init({
    server: files.serv
  })
  gulp.watch(files.sass, ['sass'])
  gulp.watch([files.html, files.js], bs.reload)
})

gulp.task('sass', function () {
  return gulp.src(files.sass)
  .pipe(sass({
    outputStyle: 'expanded'
  }))
  .on('error', function (e) {
    console.error(e.message)
    this.emit('end')
  })
  .pipe(gulp.dest(files.css))
  .pipe(bs.stream())
})
