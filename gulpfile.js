"use strict";

var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    del         = require('del'),
    pug         = require('gulp-pug'),
    cache       = require('gulp-cache'),
    notify      = require('gulp-notify'),
    imgMin      = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    gcmq        = require('gulp-group-css-media-queries'),
    csso        = require('gulp-csso'),
    useref      = require('gulp-useref'),
    gulpif      = require('gulp-if'),
    uglifyJs    = require('gulp-uglifyjs'),
    svgSprite   = require('gulp-svg-sprite'),
    path        = require('path'),
    compass     = require('gulp-compass');

//---------------------------------------SYNC

gulp.task('sync', function () {
	browserSync.init({
		server: {
			baseDir: "app/"
		},
		notify: false
	});
});

//---------------------------------------PUG

gulp.task('pug', function () {
	return gulp.src('app/*.pug')
		.pipe(pug({
			pretty: true
		}))
		.on('error', notify.onError({
			message: "<%= error.message %>",
			title  : "Pug error!"
		}))
		.pipe(gulp.dest('app/'));
});

//---------------------------------------CSS

gulp.task('compass', function () {
	gulp.src('app/sass/**/*.sass')
		.pipe(compass({
			project   : path.join(__dirname, 'app'),
			http_path : '/local',
			comments  : false,
			css       : 'css',
			image     : 'images',
			javascript: 'js',
			sass      : 'sass',
			relative  : true  // change to false before build
		}))
		.on('error', notify.onError({
			message: "<%= error.message %>",
			title  : "Compass error!"
		}))
		.pipe(gulp.dest('css'))
		.pipe(reload({stream: true}));
});

//---------------------------------------IMAGES

gulp.task('img', function () {
	return gulp.src(['app/images/**/*', '!app/images/svg/*'])
		.pipe(cache(imgMin({
			intarlaced : true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			une        : [pngquant()]
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('svgCss', function () {

	return gulp.src('app/images/css/*.svg')
		.pipe(cache(imgMin({
				intarlaced : true,
				progressive: true,
				svgoPlugins: [{removeViewBox: false}]
		})))
		.pipe(svgSprite({
			mode: {
				css: {
					dest  : './',
					sprite: '../images/sprite-css',
					bust  : false,
					layout: 'diagonal',
					render: {
						scss: {
							dest: '../sass/_sprite-css.scss',
							template: "app/templates/sprite-css.scss"
						}
					}
				}
			},
			variables: {
				mapname: "ic-css"
			}
		}))
		.pipe(gulp.dest('app/images/'));

});

gulp.task('svgSymbol', function () {

	return gulp.src('app/images/symbol/*.svg')
		.pipe(svgSprite({
			mode: {
				symbol: {
					dest  : '',
					sprite: 'sprite-symbol.svg',
					render: {
						scss: {
							dest: '../sass/_sprite-symbol.scss'
						}
					}
				}
			},
			variables: {
				mapname: "ic-symbol"
			}
		}))
		.pipe(gulp.dest('app/images/'));

});

//---------------------------------------CLEAN

gulp.task('clean', function () {
	return del.sync('dist');
});

gulp.task('cleanAppCss', function () {
	return del.sync('app/css');
});

gulp.task('cleanCss', function () {
	return del.sync('dist/css');
});

//---------------------------------------WATCH

gulp.task('watch', ['sync', 'compass', 'pug', 'svgCss'], function () {
	gulp.watch('app/sass/**/*.sass', ['compass']);
	gulp.watch('app/**/*.pug', ['pug']);
	gulp.watch('app/index.html', reload);
	gulp.watch('app/**/*.js', reload);
});

//---------------------------------------BUILD

gulp.task('build', ['clean', 'img', 'pug', 'svgCss', 'compass'], function () {

	gulp.src('app/css/**/*.css')
		.pipe(gcmq())
		.pipe(csso({
			restructure: false,
			sourceMap  : false,
			debug      : true
		}))
		.pipe(gulp.dest('dist/css'));


	gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpif('*.js', uglifyJs()))
		.pipe(gulp.dest('dist'));

	gulp.src('app/images/sprite.svg')
		.pipe(gulp.dest('dist/images'));

});

gulp.task('buildCss', ['cleanCss', 'compass'], function () {
	gulp.src('app/css/**/*.css')
		.pipe(gcmq())
		.pipe(csso({
			restructure: false,
			sourceMap  : false,
			debug      : true
		}))
		.pipe(gulp.dest('dist/css'));
});
