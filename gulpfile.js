var gulp        = require('gulp'),
		browserSync = require('browser-sync'),
		reload      = browserSync.reload,
		del         = require('del'),
		pug         = require('gulp-pug'),
		cache       = require('gulp-cache'),
		uncss       = require('gulp-uncss'),
		notify      = require('gulp-notify'),
		imgMin      = require('gulp-imagemin'),
		pngquant    = require('imagemin-pngquant'),
		gcmq        = require('gulp-group-css-media-queries'),
		csso        = require('gulp-csso'),
		useref      = require('gulp-useref'),
		gulpif      = require('gulp-if'),
		uglifyJs    = require('gulp-uglifyjs'),
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
	return gulp.src('app/images/**/*')
		.pipe(cache(imgMin({
			intarlaced : true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			une        : [pngquant()]
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('clean', function () {
	return del.sync('dist');
});

gulp.task('watch', ['sync', 'compass', 'pug'], function () {
	gulp.watch('app/sass/**/*.sass', ['compass']);
	gulp.watch('app/*.pug', reload);
	gulp.watch('app/*.html', reload);
	gulp.watch('app/**/*.js', reload);
});

gulp.task('build', ['compass', 'pug', 'img', 'clean'], function () {

	gulp.src('app/css/*.css')
		.pipe(gcmq())
		.pipe(uncss({
			html: ['app/index.html']
		}))
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

});

gulp.task('buildCss', ['compass', 'clean'], function () {
	gulp.src('app/css/*.css')
		.pipe(gcmq())
		.pipe(uncss({
			html: ['app/index.html']
		}))
		.pipe(csso({
			restructure: false,
			sourceMap: false,
			debug: true
		}))
		.pipe(gulp.dest('dist/css'));
});