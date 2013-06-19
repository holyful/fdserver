/**
 * merge文件合并
 */

var Path = require('path'),
	utils = require('../utils'),
	iconv = require('iconv-lite');


module.exports = function(req, res, next) {
	var config = req.config;
	if (!config.merge || !req.url) {
		return next();
	}

	var ext = Path.extname(req.url),
		pattern = ext === '.js' ?  /ImportJavscript\.url\(['"]([^'"]+)['"]\);?/g :
			ext === '.css' ? /@import\s+url\s*\(['"]?\s*([^'"]+)['"]?\s*\)\s*;/g : null;

	if (!pattern) {
		return next();
	}

	// disable cache
	delete req.headers['if-none-match'];
	delete req.headers['if-modified-since'];

	utils.filter(req, res, next, ext.substr(1), function(data) {
		var info = utils.decodeBuffer(data),
			str = info[0],
			encoding = info[1];

		if (pattern.test(str)) {
			mergeStyle(str, pattern, function(e, body) {
				if (e) {
					res.statusCode = e.status || 500;
					return next(e);
				}
				
				var buf = iconv.encode(body, encoding);
				res.setHeader('Content-Length', buf.length);
				res.end(buf);
			});
		} else {
			res.setHeader('Content-Length', data.length);
			res.end(data);
		}
	});
};


function mergeStyle(body, pattern, fn) {
	var urls = [];

    body = body.replace(/\/\*[^*]*\*+([^\/*][^*]*\*+)*\//g, '');
	body.replace(pattern, function(m, url) {
		urls.push(url);
	});

	var parts = [];
	utils.getUrlsContent(urls, function(ret) {
		var i;

		for (i = 0, c = ret.length; i < c; i++) {
			var o = ret[i];
			if (o.error) {
				return fn(o.error);
			}
			
			parts.push(o.content);
		}

		i = 0;
		body = body.replace(pattern, function(m, url) {
			var str = utils.decodeBuffer(parts[i++])[0];
			if (str) {
				return '/*---' + url + '---*/\n' + str;
			} else {
				return m;
			}

		});

		fn(null, body);
	});

}


