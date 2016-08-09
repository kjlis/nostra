var gulp = require('gulp');
var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var rimraf = require('rimraf');
var source = require('vinyl-source-stream');
var _ = require('lodash');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var eslint = require('gulp-eslint');
var pump = require('pump');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var config = {
    entryFile: './app/app.js',
    outputDir: './dist/',
    outputFile: 'app.js'
};

var sass = require('gulp-sass');

gulp.task('sass', function () {
    return gulp.src('./app/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
        .pipe(reload({stream: true}));
});

gulp.task('sass:watch', function () {
    gulp.watch('./app/**/*.scss', ['sass']);
});

gulp.task('clean', (cb) => {
    rimraf(config.outputDir, cb);
});

var bundler;

function getBundler() {
    if (!bundler) {
        bundler = watchify(browserify(config.entryFile, _.extend({debug: true}, watchify.args)));
    }
    return bundler;
}

function bundle() {
    return getBundler()
        .transform(babelify, {presets: ["es2016", "es2015"]})
        .bundle()
        .on('error', function (err) {
            console.log('Error: ' + err.message);
        })
        .pipe(source(config.outputFile))
        .pipe(gulp.dest(config.outputDir))
        .pipe(reload({stream: true}));
}

gulp.task('compress', () => {
    pump([
        gulp.src('dist/app.js'),
        ngAnnotate(),
        uglify(),
        gulp.dest('dist/')
    ])
});

gulp.task('lint', () => {
    return gulp.src(['./app/**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-persistent', ['lint', 'sass'], () => {
    return bundle();
});

gulp.task('build', ['build-persistent', 'compress'], () => {
    process.exit(0);
});


gulp.task('watch', ['clean', 'build-persistent', 'sass:watch'], () => {

    browserSync({
        server: {
            baseDir: './'
        }
    });

    gulp.watch('./**/**/*.html')
        .on('change', reload);

    getBundler().on('update', () => {
        gulp.start('build-persistent')
    });
});

// WEB SERVER
gulp.task('serve', () => {
    browserSync({
        server: {
            baseDir: './'
        }
    });
});
