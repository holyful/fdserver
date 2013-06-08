/**
 * server是一个中间件，它根据config.filters连接其它中间件
 */

var connect = require('connect');

module.exports = function(config) {
	config = config || {};

	var app = connect();

	config.filters.forEach(function(filter) {
		filter = require('./filter/' + filter);
		app.use(filter(config));
	});
	
	return app;
};

