const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const del = require('del');
const closureCompiler = require('google-closure-compiler').gulp();

gulp.task('backup', () => {
  return gulp.src(['public/**/*.js', '!public/**/*.min.js'], {base: './'})
    .pipe(gulp.dest('src'));
});

gulp.task('build', () => {
  return gulp.src('src/public/**/*.js', {base: './'})
    .pipe(closureCompiler({
      compilation_level: 'SIMPLE',
      language_out: 'ECMASCRIPT5_STRICT',
      output_wrapper: '(function(){\n%output%\n}).call(this)',
      js_output_file: 'bundle.min.js',
    }))
    .pipe(gulp.dest('public/js'));
});

gulp.task('production', (cb) => {
  fs.writeFile(path.join(__dirname, '.env'), 'NODE_ENV = production', cb);
});

gulp.task('clean', () => {
  return del([
    'public/**/*.js',
    '!public/**/*.min.js',
  ]);
});

gulp.task('default', gulp.series('backup', 'build', 'clean', 'production'));
