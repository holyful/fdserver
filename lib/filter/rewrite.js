/**
 * url rewrite功能
 *
 * `Support`
 *
 * {
 *	root: '/Users/bencode/webroot/styles',
 *	rewrite: [
 *		{
 *			from: '^/app/offer/(.*)$',
 *			to: '{root}/styleoffer/$1'
 *		},
 *
 *		{
 *			from: '^/app/butterfly/(.*)$',
 *			to: '{root}/butterfly/$1'
 *		},
 *
 *		{
 *			from: '^(.*)$',
 *			to: 'http://110.75.196.23$1'
 *		}
 *	]
 * }
 */

var util = require('util'),
	fs = require('fs'),
	Path = require('path'),
	http = require('http'),
	mime = require('mime'),
	connect = require('connect'),
	send = require('send'),
	utils = require('../utils');


module.exports = function(req, res, next) {
	req.config.rewrite ?
		process(req, res, next) :
		next();
};


function process(req, res, next) {
	var rewrite = req.config.rewrite,
		i = 0,
		len = rewrite.length;

	var fn = function() {
		if (i === len) {
			return next();
		}

		var rule = utils.extend({}, rewrite[i]),
			from = rule.from;

		from = typeof from === 'string' ? new RegExp(from) : from;
		rule.from = from;
		rule.test = rule.test || function(req) {
			return from && from.test(req.url);
		};

		i++;
		if (rule.test(req)) {
			tryRewrite(req, res, next, rule, fn);
		} else {
			fn();
		}
	};

	fn();
};


function tryRewrite(req, res, next, rule, fn) {
	var config = req.config,
		to = rule.to;

	util.debug('try rewrite: ' + rule.from + ' -> ' + rule.to);

	to = to.replace(/\{?([_a-zA-Z]\w*)\}?/g, function(m, name) {
		return config[name] || m;
	});

	rule.url = req.url.replace(rule.from, to);
	util.debug('rewrite to: ' + rule.url);
	
	if (/^http(s)?:\/\//.test(rule.url)) {
		rewriteToUrl(req, res, next, rule, fn);
	} else {
		rewriteToFs(req, res, next, rule, fn);
	}
}


function rewriteToUrl(req, res, next, rule, fn) {
	http.get(rule.url, function(r) {
		if (r.statusCode === 404) {
			return next(404);
		}

		if (r.statusCode === 302) {
			res.statusCode = 302;
			res.setHeader('location', r.headers.location);
			res.end();
		}

		r.on('data', function(data) {
			res.write(data)	
		});

		r.on('end', function() {
			res.end();
		});
	});
}


function rewriteToFs(req, res, next, rule, fn) {
	var path = rule.url.replace(/\?.*$/, '');
	exists(req, path, function(path) {
		if (!path) {
			return fn();
		}

		fs.stat(path, function(err, stat) {
			if (err) {
				return next(err);
			}
			
			req.filepath = path;
			req.fileext = Path.extname(path);

			res.setHeader('Content-Type', mime.lookup(path));
			res.setHeader('File-Path', path);
			
			if (stat.isFile()) {
				var static = connect.static(Path.dirname(path));
				req.url = Path.basename(path);
				static(req, res, next);

			} else if (stat.isDirectory()) {
				var dir = connect.directory(path);
				req.url = '/';
				dir(req, res, next);

			} else {
				next(new Error('invalid file:' + path));
			}

		});

	});

}


function exists(req, path, fn) {
	var newPath	= Path.join(req.config.root || '', path);
	fs.exists(newPath, function(exists) {
		if (exists) {
			return fn(newPath);
		}

		fs.exists(path, function(pexists) {
			if (pexists) {
				return fn(path);
			}

			return fn(false);
		});
	});
}

