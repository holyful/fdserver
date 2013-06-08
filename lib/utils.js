/**
 * 一些工具方法
 */

exports.extend = function(des, src) {
	if (src) {
		for (var k in src) {
			var v = src[k];
			if (v !== undefined && v !== null) {
				des[k] = v;
			}
		}
	}
	return des;
};


/**
 * 取得host相关的配置
 */
exports.hostConfig = function(config, req) {
	var result = exports.extend({}, config);
	delete result.hosts;

	var hosts = config.hosts || {},
		name = req.headers.host.split(':')[0];

	return exports.extend(result, hosts[name]);
};
