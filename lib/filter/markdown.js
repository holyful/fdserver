/**
 * markdown支持
 */

var Path = require('path'),
	utils = require('../utils'),
	iconv = require('iconv-lite');


module.exports = function(req, res, next) {
	utils.filter(req, res, next, 'md', function(data) {
		var info = utils.decodeBuffer(data),
			text = info[0],
			encoding = info[1];

		var markdown = require('markdown').markdown,
			html = markdown.toHTML(text),
			buf = iconv.encode(html, encoding);

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Content-Length', buf.length);
		res.end(buf);
	});

};

