var gulp = require('gulp'),
  header = require('gulp-header'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  del = require('del'),
  d = new Date(),
  headerComment = '/* Generated on:' + Format(d, "yyyy-MM-dd") + '. Copyright (c) 2016 laneleads https://github.com/laneleads/ouph-jsSDK */ \r\n';


gulp.task('default', function () {
  gulp.src('tracking.js')
    .pipe(uglify())
    .pipe(header(headerComment))
    .pipe(rename('tracking.min.js'))
    .pipe(gulp.dest('build'));
});

function Format(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "h+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    "S": date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}