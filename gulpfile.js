const gulp = require('gulp');
const csv = require('csv');
const csvtojson = require('gulp-csv2json');
const through = require('through2');
const path = require('path');
const gutil = require('gulp-util');
var argv = require('yargs').argv;

gulp.task('convert:json',() => {
  return gulp.src('datasets/csv/small/**/*.csv')
    .pipe(csvtojson())
    .pipe(gulp.dest('datasets/json'))
});

gulp.task('split', () => {
  var percent = (argv.percent === undefined) ? 10 : argv.percent;
  return gulp.src('datasets/csv/small/**/*.csv')
    .pipe(csvtransform({percent: percent}))
    .pipe(gulp.dest(`datasets/csv/split/${percent}`));
});

const csvtransform = function (options) {
  var opts = options || {};
  opts.percent = (opts.percent || 10) / 100;

  return through.obj(transform);
  function transform(file, encoding, done) {
    if (file.isNull()) {
      this.push(file);
      return done();
    }    
    const self = this
    const parser = csv.parse();
    var splitted = '';
    var processedCount = 0;
    self.file = file;
    file.pipe(parser)
      .on('end', function() {
        self.push(new gutil.File({
          cwd : self.file.cwd,
          base: self.file.base,
          path: self.file.path, //path.basename(self.file.path, path.extname(self.file.path)),
          contents: new Buffer(splitted)
        }))
        console.log(`Finished: ${self.file.path}`);
        done();
      })
      .on('data', function(record) {
        if (this.count * opts.percent > processedCount) { 
          splitted += record.join(',') + '\n';
          processedCount++;
        }
      })
      .on('error', function(err) {
        done(err)
      });
  };
}

gulp.task('default', ['convert:json']);