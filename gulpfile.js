/* dorado theme */
var gulp		= require('gulp');
var uglify		= require('gulp-uglify');
var rename		= require('gulp-rename');
var rigger		= require('gulp-rigger');
var del			= require('del');
var newer		= require('gulp-newer');

gulp.task('clean', function(){ return del(['build/*']); });

gulp.task('js', function() {
	return gulp.src('src/jquery.mk-databridge.js')
		//.pipe(newer('build/jquery.mk-databridge.min.js'))
		.pipe(rigger())
		.pipe(gulp.dest('build/'))
		.pipe(uglify())
		.pipe(rename('jquery.mk-databridge.min.js'))
		.pipe(gulp.dest('build/'));
});

gulp.task('watch', function () {
	gulp.watch('src/*.js',gulp.parallel( 'js' ))
});

gulp.task('build', gulp.parallel( 'js' ));
gulp.task('clean_build', gulp.series('clean','build'));