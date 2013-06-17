/**
 * 默认filter
 * 提供日志和服务器静态资源访问
 */
var connect = require('connect');

module.exports = function(req, res, next) {
	var app = connect()
		.use(connect.logger(req.config.logger || 'default'))
		.use(connect.static('public'))
		.use(connect.query());

	return app(req, res, next);
};
