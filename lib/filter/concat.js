/**
 * tengine concat功能
 */

var utils = require('../utils'),
	iconv = require('iconv-lite');


exports = module.exports = function(config) {

	return function concat(req, res, next) {
		if (/^\/?\?\?\S+/.test(req.url)) {
			process(req, res, next);
		} else {
			next();
		}
	}

};


function process(req, res, next, config) {
	var parts = req.url.replace(/^\/?\?\?/, '').split(/\s*,\s*/),
		host = req.headers.host,
		urls = [];

	parts.forEach(function(part) {
		urls.push('http://' + host + '/' + part);
	});

	concatStyle(urls, res, next);
}


function concatStyle(urls, res, next) {
	var list = [];
	utils.getUrlsContent(urls, function(ret) {
		var encoding = null;

		for (var i = 0, c = ret.length; i < c; i++) {
			var o = ret[i];
			if (o.error) {
				return next(o.error);
			}
			
			list.push('/*---' + urls[i] + '---*/');
			var info = utils.decodeBuffer(o.content);
			encoding = encoding || info[1];
			list.push(info[0]);
		}
		
		var buf = iconv.encode(list.join('\n'), encoding);
		res.end(buf);
	});
}
