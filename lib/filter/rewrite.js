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
	connect = require('connect'),
	send = require('send'),
	utils = require('../utils');


module.exports = function(req, res, next) {
	var config = req.config;
	config.rewrite ?
		process(req, res, next, config) :
		next();
};


function process(req, res, next, config) {
	var rewrite = config.rewrite,
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

		if (rule.test(req)) {
			tryRewrite(req, res, next, config, rule);
		} else {
			i++;
			fn();
		}
	};

	fn();
};


function tryRewrite(req, res, next, config, rule) {
	var to = rule.to;

	util.debug('try rewrite: ' + rule.from + ' -> ' + rule.to);

	to = to.replace(/\{?([_a-zA-Z]\w*)\}?/g, function(m, name) {
		return config[name] || m;
	});

	rule.url = req.url.replace(rule.from, to);
	util.debug('rewrite to: ' + rule.url);
	
	if (/^http(s)?:\/\//.test(rule.url)) {
		rewriteToUrl(req, res, next, config, rule);
	} else {
		rewriteToFs(req, res, next, config, rule);
	}
}

function rewriteToUrl(req, res, next, config, rule) {
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

function rewriteToFs(req, res, next, config, rule) {
	var path = rule.url.replace(/\?.*/, '');
	fs.stat(path, function(err, stat) {
		if (err) {
			return next(err);
		}

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
}
