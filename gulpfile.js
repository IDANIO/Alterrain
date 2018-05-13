const gulp = require('gulp');
const closureCompiler = require('google-closure-compiler').gulp();

gulp.task('build', () => {
  return gulp.src('./src/public/**.js', {base: './'})
    .pipe(closureCompiler({
      compilation_level: 'SIMPLE',
      language_out: 'ECMASCRIPT5_STRICT',
      output_wrapper: '(function(){\n%output%\n}).call(this)',
      js_output_file: 'bundle.min.js',
    }))
    .pipe(gulp.dest('./public/js/'));
});

