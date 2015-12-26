var basePaths = {
  src: 'src/',
  dest: 'assets/',
  bower: 'bower_components/'
};
var paths = {
  scripts: {
    src: basePaths.src + 'scripts/',
    dest: basePaths.dest + 'js/'
  },
  styles: {
    src: basePaths.src + 'styles/',
    dest: basePaths.dest + 'css/'
  },
  fonts: {
    src: basePaths.src + 'fonts/',
    dest: basePaths.dest + 'fonts/'
  },
  images: {
    src: basePaths.src + 'images/',
    dest: basePaths.dest + 'images/'
  }
};

var appFiles = {
  styles: [ paths.styles.src + '**/*.scss' ],
  scripts: [ paths.scripts.src + '**/*.js' ],
  fonts: []
};

/*
  Let the magic begin
*/

var gulp = require('gulp');

var es = require('event-stream');
var gutil = require('gulp-util');
var del = require('del');

var plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
});

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';
var sourceMap = false;

if(gutil.env.dev === true) {
  sassStyle = 'expanded';
  sourceMap = true;
  isProduction = false;
}

var changeEvent = function(evt) {
  gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

var clean = function(path, cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del([path], {force:true}, cb);
};

gulp.task('css', function(){
  // app css
  return gulp.src(appFiles.styles)
    .pipe(plugins.rubySass({
      style: sassStyle, sourcemap: sourceMap, precision: 2
    }))
    // .pipe(plugins.concat('style.min.css'))
    .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'))
    // .pipe(isProduction ? plugins.combineMediaQueries({
      // log: true
    // }) : gutil.noop())
    .pipe(isProduction ? plugins.cssmin() : gutil.noop())
    .pipe(plugins.size())
    .on('error', function(err){
      new gutil.PluginError('CSS', err, {showStack: true});
    })
    .pipe(plugins.notify())
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('scripts', function(){

  return gulp.src(appFiles.scripts)
    // .pipe(plugins.concat('app.js'))
    .pipe(isProduction ? plugins.uglify() : gutil.noop())
    .pipe(plugins.size())
    .pipe(plugins.notify())
    .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('fonts', function(){
  return gulp.src(appFiles.fonts)
    .pipe(gulp.dest(paths.fonts.dest));
});


gulp.task('images', function(){
  return gulp.src(paths.images.src + '/**/*')
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('vendor', function(){
  return gulp.src(basePaths.bower + '/**/*')
    .pipe(gulp.dest(basePaths.dest + '/vendor'));
});


gulp.task('watch', ['css', 'scripts', 'fonts', 'images', 'vendor'], function(){
  gulp.watch(appFiles.styles, ['css']).on('change', function(evt) {
    changeEvent(evt);
  });

  gulp.watch(paths.scripts.src + '*.js', ['scripts']).on('change', function(evt) {
    changeEvent(evt);
  });
});

gulp.task('default', ['css', 'scripts', 'fonts', 'images', 'vendor']);