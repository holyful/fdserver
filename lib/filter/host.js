/**
 * 基于host资源访问的基本功能
 */

var Path = require('path'),
	connect = require('connect'),
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
	req.filepath = Path.join(config.root, req.url);
	res.setHeader('File-Path', req.filepath);

	var app = connect()
		.use(connect.static(config.root))
		.use(connect.directory(config.root));

	app(req, res, next);
}

