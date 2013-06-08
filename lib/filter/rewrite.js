/**
 * url rewrite功能
 */

var utils = require('../utils');


exports = module.exports = function(config) {
	return function rewrite(req, res, next) {
		var hostConfig = utils.hostConfig(config, req);
		hostConfig.rewrite ?
			exports.process(req, res, next, hostConfig) :
			next();
	};
};


exports.process = function(req, res, next, config) {
	var rewrite = config.rewrite;
	rewrite.forEach(function(rule) {
		var from = rule.from,
			to = rule.to;
		tryRules(req, res, next, rule, config);
	});
};

