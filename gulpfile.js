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
    srcDir: './nostra-client/app/',
    entryFile: './nostra-client/app/app.js',
    outputDir: './nostra-client/dist/',
    outputFile: 'app.js'
};
var rename = require('gulp-rename');
var sass = require('gulp-sass');

gulp.task('clean', (cb) => {
    rimraf(config.outputDir, cb);
});

gulp.task('sass', () => {
    return gulp.src(config.srcDir + 'main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(config.outputDir + 'css'))
        .pipe(reload({stream: true}));
});

gulp.task('html', () => {
    return gulp.src(config.srcDir + 'templates/*.html')
        .pipe(gulp.dest(config.outputDir + 'templates'))
        .pipe(reload({stream: true}));
});

gulp.task('sass:watch', ['sass'], function () {
    gulp.watch(config.srcDir + '**/*.scss', ['sass']);
    gulp.watch(config.srcDir + 'templates/*.html', ['html']);
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

gulp.task('lint', () => {
    return gulp.src(['./app/**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build-persistent', ['html', 'lint', 'sass'], () => {
    return bundle();
});

gulp.task('compress', ['build-persistent'], () => {
    return pump([
        gulp.src(config.outputDir + config.outputFile),
        ngAnnotate(),
        uglify(),
        rename({
            suffix: '.min'
        }),
        gulp.dest(config.outputDir)
    ]);
});

gulp.task('build', ['compress'], () => {
    getBundler().close();
});

gulp.task('publish', ['build'], () => {
    return gulp.src(config.outputDir + '**/*')
        .pipe(gulp.dest('./nostra-service/public/dist/'))
});


gulp.task('watch', ['build-persistent', 'sass:watch'], () => {

    browserSync({
        server: {
            baseDir: './nostra-client/'
        }
    });

    getBundler().on('update', () => {
        gulp.start('build-persistent')
    });
});

// WEB SERVER
gulp.task('serve', () => {
    browserSync({
        server: {
            baseDir: './nostra-client/'
        }
    });
});
