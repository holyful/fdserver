/**
 * jade模板支持
 */

var iconv = require('iconv-lite'),
	jade = require('jade'),
	utils = require('../utils');


module.exports = function(req, res, next) {
	utils.filter(req, res, next, '.jade', function(data) {
		var info = utils.decodeBuffer(data),
			text = info[0],
			encoding = info[1],
			options = utils.extend({
				pretty: true
			}, req.config.jade);

		var html = jade.compile(text, options)(),
			buf = iconv.encode(html, encoding);

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Content-Length', buf.length);
		res.end(buf);
	});
};

