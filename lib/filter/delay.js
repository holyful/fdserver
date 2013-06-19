/**
 * 资源延迟访问
 */

var utils = require('../utils');


module.exports = function(req, res, next) {
	var delay = parseFloat(req.query.delay);
	if (!delay) {
		return next();
	}

	var end = res.end;
	res.end = function() {
		res.end = end;

		var args = arguments;
		setTimeout(function() {
			end.apply(res, args);
		}, delay * 1000);
	};

	next();
};


