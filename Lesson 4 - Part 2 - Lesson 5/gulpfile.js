/*eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jasmineBrowser = require('gulp-jasmine-browser');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task(
	'default',
	['copy-html', 'copy-images', 'styles', 'lint', 'scripts'],
	async function() {
		gulp.watch('sass/**/*.scss', ['styles']);
		gulp.watch('js/**/*.js', ['lint']);
		gulp.watch('/index.html', ['copy-html']);
		gulp.watch('./dist/index.html').on('change', browserSync.reload);

		browserSync.init({
			server: './dist'
		});
	}
);

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'lint',
	'scripts-dist',
	'img-min'
]);

gulp.task('scripts', async function() {
	gulp
		.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', async function() {
	gulp
		.src('js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', async function() {
	gulp.src('./index.html').pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', async function() {
	gulp.src('img/*').pipe(gulp.dest('dist/img'));
});

gulp.task('styles', async function() {
	gulp
		.src('sass/**/*.scss')
		.pipe(
			sass({
				outputStyle: 'compressed'
			}).on('error', sass.logError)
		)
		.pipe(
			autoprefixer({
				browsers: ['last 2 versions']
			})
		)
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

gulp.task('lint', async function() {
	return (
		gulp
			.src(['js/**/*.js'])
			// eslint() attaches the lint output to the eslint property
			// of the file object so it can be used by other modules.
			.pipe(eslint())
			// eslint.format() outputs the lint results to the console.
			// Alternatively use eslint.formatEach() (see Docs).
			.pipe(eslint.format())
			// To have the process exit with an error code (1) on
			// lint error, return the stream and pipe to failOnError last.
			.pipe(eslint.failOnError())
	);
});

gulp.task('img-min', async function() {
    return gulp.src('src/images/*')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('dist/images'));
});

// gulp.task('tests', async function() {
// 	return gulp
// 		.src('tests/spec/extraSpec.js')
// 		.pipe(jasmineBrowser.specRunner({ console: false }))
// 		.pipe(jasmineBrowser.headless({ driver: 'chrome' }));
// });

gulp.task('tests', async function() {
	gulp
		.src('tests/spec/extraSpec.js')
		.pipe(jasmineBrowser.specRunner())
		.pipe(jasmineBrowser.server({ port: 3001 }));
});
