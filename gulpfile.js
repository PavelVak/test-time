var gulp = require('gulp');
var ts = require('gulp-typescript');

gulp.task('compile', function () {
    return gulp.src('ts/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'main.js'
        }))
        .pipe(gulp.dest('js'));
});

gulp.task('watch', ['compile'], function(){
    gulp.watch('ts/*.ts', ['compile'])
})
