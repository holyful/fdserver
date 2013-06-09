/**
 * server是一个中间件，它根据config.filters连接其它中间件
 */

var connect = require('connect'),
	utils = require('./utils');

module.exports = function(config) {
	config = config || {};

	var app = connect();

	config.filters.forEach(function(name) {
		var filter = require('./filter/' + name);

		var proxy = function(req, res, next) {
			filter(utils.hostConfig(config, req))(req, res, next);
		};
		proxy.name = name;
		
		app.use(proxy);
	});
	
	return app;
};

