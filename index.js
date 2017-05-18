'use strict';
var through = require('through2');
var path = require('path');
var fs = require('fs');
var objectAssign = require('object-assign');
var maps = {};
var options = {
    map: '', // map path
    js_prefix: '/', // js 加载路劲前缀
    css_prefix: '/', // css加载路劲前缀
    js_default: [],  // 默认加载的js库
    css_default: []  // 默认加载的css库
};

var getIdsByPath = function (path) {
    var ids = [];

    for (var key in maps) {
        if (maps[key].path === path) {
            ids.push(key);
        }
    }

    return ids;
};

var loadDepsByIds = function (ids, paths) {
    ids.forEach(function (id) {
        if (!id || !maps[id]) {
            return;
        }
        var dep = maps[id];

        if (dep && dep.deps) {
            loadDepsByIds(dep.deps, paths);
        }

        if (paths.indexOf(dep.path) < 0) {
            paths.push(dep.path);
        }
    });
};

var loadJSDeps = function (file, defaultDeps) {
    var filePath = file.path;
    var filename = path.basename(filePath, '.html');
    var dir = path.dirname(filePath);
    var jsPath = dir + '/' + filename + '.js';
    var paths = defaultDeps || [];

    if (fs.existsSync(jsPath)) {
        jsPath = path.relative(file.base, jsPath);
        var ids = getIdsByPath(jsPath);

        loadDepsByIds(ids, paths);
    }

    return paths;
};

var loadCssDeps = function (file, js, defaultDeps) {
    var filePath = file.path;
    var filename = path.basename(filePath, '.html');
    var dir = path.dirname(filePath);
    var jsPath = dir + '/' + filename + '.js';
    var paths = defaultDeps || [];

    js = js.slice();
    jsPath = path.relative(file.base, jsPath);

    if (js.indexOf(jsPath) < 0) {
        js.push(jsPath);
    }

    js.forEach(function (p) {
        p = p.replace(/([^\w|^\d])js([^\w|^\d]|$)/gm, '$1css$2');

        var rPath = path.resolve(file.base, p);
        if (paths.indexOf(p) < 0 && fs.existsSync(rPath)) {
            paths.push(p);
        }
    });

    return paths;
};

module.exports = function (opts) {
    objectAssign(options, opts);
    if (typeof options.map === 'string' && /.json$/.test(options.map)) {
        maps = require(path.resolve(options.map));
    } else if (typeof options.map === 'object') {
        maps = options.map;
    }

    return through.obj(function (file, enc, cb) {
        var js = loadJSDeps(file, options.js_default);
        var css = loadCssDeps(file, js, options.css_default);
        var chunk;
        var tpl;

        if (js.length) {
            chunk = String(file.contents);
            tpl = '<script type="text/javascript" src="' + options.js_prefix + js.join('"></script>\n<script type="text/javascript" src="' + options.js_prefix) + '"></script>\n';
            chunk = chunk.replace('</body>', tpl + '</body>');

            file.contents = new Buffer(chunk);
        }

        if (css.length) {
            chunk = String(file.contents);
            tpl = '<link rel="stylesheet" href="' + options.css_prefix + css.join('">\n<link rel="stylesheet" href="' + options.css_prefix) + '">\n';
            chunk = /(<link[\s\S]*<\/head>)/.test(chunk) ? chunk.replace(/(<link[\s\S]*<\/head>)/g, tpl + '$1') : chunk.replace('</head>', tpl + '</head>')

            file.contents = new Buffer(chunk);
        }

        cb(null, file);
    });
};
