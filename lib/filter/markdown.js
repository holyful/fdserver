/**
 * markdown支持
 */

var Path = require('path'),
	utils = require('../utils'),
	iconv = require('iconv-lite');


module.exports = function(req, res, next) {

	var ext = Path.extname(req.url);
	ext === '.md' ? process(req, res, next) :
		next();
};


function process(req, res, next) {
	var end = res.end,
		list = [];

	res.write = function(chunk) {
		list.push(chunk);
	};

	res.end = function(chunk) {
		chunk && list.push(chunk);

		if (!list.length) {
			return end.call(res);
		}

		var info = utils.decodeBuffer(Buffer.concat(list)),
			text = info[0],
			encoding = info[1];

		var markdown = require('markdown').markdown,
			html = markdown.toHTML(text),
			buf = iconv.encode(html, encoding);

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Content-Length', buf.length);
		end.call(res, buf);
	};

	next();

}
