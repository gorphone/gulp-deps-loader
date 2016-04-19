# gulp-deps-loader

Depend on gulp-deps-map, you can intstall by 
```
npm install gulp-deps-loader --save
```

usage:
```Javascript
var gulpDepsloader = require('gulp-deps-loader');
var ignore = require('gulp-ignore');
var watch = require('gulp-watch');

// html load js & css and release
var options = {
    map: './public/src/map.json', // map path
    js_prefix: '/src/', // js 加载路劲前缀
    css_prefix: '/src/', // css加载路劲前缀
    js_default: [
	'common/lib/node_modules/jquery/dist/jquery.js',
	'common/lib/node_modules/angular/angular.js',
	'common/lib/node_modules/bootstrap/dist/js/bootstrap.js'
    ],  // 默认加载的js库
    css_default: [
	'common/lib/node_modules/bootstrap/dist/css/bootstrap.css',
	'common/lib/node_modules/components-font-awesome/css/font-awesome.css',
	'common/css/bootstrap-ext.css'
    ]  // 默认加载的css库
};

gulp.src('./src/**/*.html')
    .pipe(ignore('.**/directive/**/*.html')) // release by loader
    .pipe(watch(['./src/**/*.html', '!./src/**/directive/**/*.html']))
    .pipe(gulpDepsloader(options))
    // .pipe(combo(null, {async: false}))
    .pipe(gulp.dest('./templates/src/'));
```
this plugin will load css which has the same path and name with js depended by html
