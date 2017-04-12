var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    del         = require('del'),
    cache       = require('gulp-cache'),
    uncss       = require('gulp-uncss'),
    notify      = require('gulp-notify'),
    imgMin      = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    concat      = require('gulp-concat'),
    compass     = require('gulp-compass');


gulp.task('sync', function () {
	browserSync.init({
		server: {
			baseDir: "app/"
		},
		notify: false
	});
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
				message: "<% error.message %>",
				title  : "Compass error!"
			}
		))
		.pipe(gulp.dest('app/css'))
		.pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
	return gulp.src([
		'app/libs/slick-carousel/slick/slick.min.js',
		'app/libs/fancybox/dist/jquery.fancybox.min.js'])
		.pipe(concat('lib.js'))
		.pipe(gulp.dest('app/js'));
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

gulp.task('watch', ['sync', 'compass', 'scripts'], function () {
	gulp.watch('app/sass/**/*.sass', ['compass']);
	gulp.watch('app/*.html', reload);
	gulp.watch('app/**/*.js', reload);
});

gulp.task('build', ['clean', 'compass', 'img', 'scripts'], function () {

	var buildCss = gulp.src('app/css/*.css')
		.pipe(uncss({
			html: ['app/index.html']
		}))
		.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/custom.js')
		.pipe(gulp.dest('dist/js'));

	var buildLibsJs = gulp.src('app/js/lib.js')
		.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('app/*.html')
		.pipe(gulp.dest('dist'));

});
