/**
 * 默认filter
 * 提供日志和服务器静态资源访问
 */
var connect = require('connect');

module.exports = function(config) {
	return connect()
		.use(connect.logger(config.logger || 'default'))
		.use(connect.static('public'));
};
