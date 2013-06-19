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

	var ext = Path.extname(req.url.replace(/\?.*/, '')),
		pattern = ext === '.js' ?  /ImportJavscript\.url\(['"]([^'"]+)['"]\);?/g :
			ext === '.css' ? /@import\s+url\s*\(['"]?\s*([^'"]+)['"]?\s*\)\s*;/g : null;

	if (!pattern) {
		return next();
	}

	// disable cache
	delete req.headers['if-none-match'];
	delete req.headers['if-modified-since'];

	var write = res.write,
		end = res.end,
		list = [];

	res.write = function(chunk) {
		list.push(chunk);
	};

	res.end = function(chunk) {
		res.write = write;
		res.end = end;

		chunk && list.push(chunk);
		if (!list.length) {
			return end.call(res);
		}

		var buf = Buffer.concat(list),
			info = utils.decodeBuffer(buf),
			str = info[0],
			encoding = info[1];

		if (pattern.test(str)) {
			mergeStyle(str, pattern, function(e, body) {
				if (e) {
					res.statusCode = e.status || 500;
					return next(e);
				}
				
				buf = iconv.encode(body, encoding);
				res.setHeader('Content-Length', buf.length);
				res.end(buf);
			});
		} else {
			res.setHeader('Content-Length', buf.length);
			res.end(buf);
		}
	};

	next();
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


