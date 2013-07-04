/**
 * tengine concat和小米concat功能
 */

var Path = require('path'),
	utils = require('../utils'),
	iconv = require('iconv-lite'),
	mime = require('mime');


module.exports = function(req, res, next) {
	if (/^\/?\?\?\S+/.test(req.url)) {
		return tengineConcat(req, res, next);
	}

	if (isMConcat(req)) {
		return mConcat(req, res, next);
	}

	next();
};


function tengineConcat(req, res, next) {
	var parts = req.url.replace(/^\/?\?\?/, '').split(/\s*,\s*/),
		host = req.headers.host,
		urls = [];

	parts.forEach(function(part) {
		urls.push('http://' + host + '/' + part);
	});

	concat(req, res, next, urls);
}


function isMConcat(req) {
	return /^cdn\.c\.aliimg\.com/.test(req.headers.host);
}


function mConcat(req, res, next) {
	var host = 'http://style.c.aliimg.com',
		url = decodeURIComponent(req.url.replace(/\?.*$/, '')),
		ext = Path.extname(url),
		parts = url.split('|');

	var rExt = new RegExp(ext + '$');

	var urls = parts.map(function(part) {
		return host + part.replace(rExt, '') + ext;	
	});

	concat(req, res, next, urls);
}


function concat(req, res, next, urls) {
	var fn = function(e, buf) {
		if (e) {
			return next(e);
		}

		res.setHeader('Content-Type', mime.lookup(urls[0]));
		res.setHeader('Content-Length', buf.length);
		res.end(buf);
	};

	if (req.config.concatSplit) {
		concatSplit(urls, fn);
	} else {
		concatJoin(urls, fn);
	}
}


function concatJoin(urls, fn) {
	utils.getUrlsContent(urls, function(ret) {
		var list = [],
			encoding = null;

		for (var i = 0, c = ret.length; i < c; i++) {
			var o = ret[i];
			if (o.error) {
				return fn(o.error);
			}
			
			var info = utils.decodeBuffer(o.content);
			if (info === false) {
				return fn(new Error('decode error: ' + urls[i]));
			}
			encoding = encoding || info[1];
			list.push('/*---' + urls[i] + '---*/');
			list.push(info[0]);
		}
		
		fn(null, iconv.encode(list.join('\n'), encoding))
	});
}


function concatSplit(urls, fn) {
	var type = Path.extname(urls[0]),
		tpl = type === '.css' ? 
			'@import url({0});' :
			"document.write('<script type=\"text/javascript\" src=\"{0}\"></scr'+'ipt>');";

	var parts = urls.map(function(url) {
		return utils.substitute(tpl, [url])	;
	});

	fn(null, iconv.encode(parts.join('\n')));
}
