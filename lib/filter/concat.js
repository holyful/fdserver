/**
 * tengine concat功能
 */

var utils = require('../utils'),
	iconv = require('iconv-lite');


module.exports = function(req, res, next) {
	console.log(req.url);
	console.log(/^\/?\?\?\S+/.test(req.url));
	if (/^\/?\?\?\S+/.test(req.url)) {
		process(req, res, next);
	} else {
		next();
	}
};


function process(req, res, next) {
	var parts = req.url.replace(/^\/?\?\?/, '').split(/\s*,\s*/),
		host = req.headers.host,
		urls = [];

	parts.forEach(function(part) {
		urls.push('http://' + host + '/' + part);
	});

	concatStyle(urls, res, next);
}


function concatStyle(urls, res, next) {
	utils.getUrlsContent(urls, function(ret) {
		var list = [],
			encoding = null;

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
