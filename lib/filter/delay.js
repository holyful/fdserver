/**
 * 资源延迟访问
 */

var utils = require('../utils');


exports = module.exports = function(config) {
	
	return function delay(req, res, next) {
		var delay = parseFloat(req.query.delay);
		if (!delay) {
			return next();
		}

		var end = res.end;
		res.end = function() {
			var args = arguments;
			setTimeout(function() {
				end.apply(res, args);
			}, delay * 1000);
		};

		next();
	};

};


