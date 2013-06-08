/**
 * 基于host资源访问的基本功能
 */

var connect = require('connect'),
	utils = require('../utils');


/**
 * Options:
 *	`root`	根目录
 */
exports = module.exports = function(config) {
	return function style(req, res, next) {
		var hostConfig = utils.hostConfig(config, req);
		hostConfig.root ? 
			exports.process(req, res, next, hostConfig) :
			next();
	};
};


exports.process = function(req, res, next, config) {
	var app = connect()
		.use(connect.static(config.root))
		.use(connect.directory(config.root));

	app(req, res, next);
};

