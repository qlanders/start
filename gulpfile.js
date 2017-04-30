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
		compass     = require('gulp-compass');


gulp.task('sync', function () {
	browserSync.init({
		server: {
			baseDir: "app/"
		},
		notify: false
	});
});

gulp.task('pug', function () {
	return gulp.src('app/*.pug')
	.pipe(pug({
		pretty: true
	}))
	.on('error', notify.onError(
		{
			message: "<%= error.message %>",
			title  : "Pug error!"
		}
	))
	.pipe(gulp.dest('app/'));
});

gulp.task('compass', function () {
	gulp.src('app/sass/**/*.sass')
		.pipe(compass({
			config_file: 'app/config.rb',
			css        : 'app/css',
			sass       : 'app/sass'
		}))
		.on('error', notify.onError(
			{
				message: "<%= error.message %>",
				title  : "Compass error!"
			}
		))
		.pipe(gulp.dest('app/css'))
		.pipe(reload({stream: true}));
});

gulp.task('img', function () {
	return gulp.src(['app/images/**/*', '!app/images/svg/*', '!app/images/sprite.svg'])
		.pipe(cache(imgMin({
			intarlaced : true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			une        : [pngquant()]
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('svgSprite', function () {
	return gulp.src('app/images/svg/*.svg')
	.pipe(svgSprite({
		mode: {
			symbol: {
				dest: '',
				sprite: 'sprite',
				render: {
					scss: {
						dest: '../sass/_sprite.scss'
					}
				}
			}
		}
	}))
	.on('error', notify.onError(
		{
			message: "<%= error.message %>",
			title  : "SVG error!"
		}
	))
	.pipe(gulp.dest('app/images/'));
});

gulp.task('clean', function () {
	return del.sync('dist');
});

gulp.task('watch', ['sync', 'compass', 'pug', 'svgSprite'], function () {
	gulp.watch('app/sass/**/*.sass', ['compass']);
	gulp.watch('app/**/*.pug', ['pug']);
	gulp.watch('app/index.html', reload);
	gulp.watch('app/**/*.js', reload);
});

gulp.task('build', ['clean', 'compass', 'pug', 'svgSprite', 'img'], function () {

	gulp.src('app/css/**/*.css')
		.pipe(gcmq())
		.pipe(csso({
			restructure: false,
			sourceMap: false,
			debug: true
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

gulp.task('buildCss', ['clean', 'compass'], function () {
	gulp.src('app/css/*.css')
		.pipe(gcmq())
		.pipe(csso({
			restructure: false,
			sourceMap: false,
			debug: true
		}))
		.pipe(gulp.dest('dist/css'));
});