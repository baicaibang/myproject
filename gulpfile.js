/**
 * Created by clear on 15/09/23.
 */
"use strict";

var gulplib = require('./common/gulplib');

gulplib.bundle_lib('api', ['dnode', 'shoe', 'q', 'md5', 'moment']);
gulplib.bundle_lib('angular', ['angular', 'angular-route', 'angular-sanitize', 'angular-touch']);
gulplib.bundle_lib('jquery', ['jquery', 'jquery-ui']);
gulplib.bundle_lib('bootstrap', ["bootstrap"]);
gulplib.bundle_lib('notie', ['notie']);
gulplib.bundle_lib('swiper', ['swiper']);

gulplib.angular_app('portal', 'public/portal');
gulplib.angular_app('manager', 'public/manager');

gulplib.dist(function(){
    var gulp = require('gulp');
    var filter = require('gulp-filter');
    var dist_all = [
        gulp.src(['public/**/*'])
            .pipe(filter(['**', '!**/controller.js', '!**/*.less', '!**/*.css.map']))
            .pipe(gulp.dest('dist/public')),
        gulp.src('api/**/*')
            .pipe(gulp.dest('dist/api')),
        gulp.src('common/**/*')
            .pipe(gulp.dest('dist/common'))
    ];
    var copy;
    copy = [
        'README.md',
        'package.json',
        'server.js'
    ];
    for(var i=0; i<copy.length; i++){
        var fname = copy[i];
        dist_all.push(gulp.src(fname).pipe(gulp.dest('dist')));
    }
    copy = [
        'config',
        'public'
    ];
    for(var i=0; i<copy.length; i++){
        var fname = copy[i];
        dist_all.push(gulp.src(fname+'/**/*').pipe(gulp.dest('dist/'+fname)));
    }
    return dist_all;
});

gulplib.final('qmtrip');
