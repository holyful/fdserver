/**
 * 基于host资源访问的基本功能
 */

var connect = require('connect'),
	utils = require('../utils');


/**
 * Options:
 *	`root`	根目录
 */
module.exports = function(req, res, next) {
	var config = req.config;
	config.root ? 
		process(req, res, next, config) :
		next();
};


function process(req, res, next, config) {
	var app = connect()
		.use(connect.static(config.root))
		.use(connect.directory(config.root));

	app(req, res, next);
}

