var gulp = require('gulp')
var uglify = require('gulp-uglify') //压缩js文件

var jsSrc = [
  'dist/dev/mp-weixin/packageGoNews/**/*.js'
  // '!dist/dev/mp-weixin/common/vendor.js',
  // '!dist/dev/mp-weixin/node-modules/{,/**}'
]
var dist = 'dist/build/mp-weixin/packageGoNews/'
gulp.task('js', function () {
  gulp.src(jsSrc).pipe(uglify()).pipe(gulp.dest(dist))
})
