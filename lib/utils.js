/**
 * 一些工具方法
 */

var util = require('util'),
	http = require('http'),
	iconv = require('iconv-lite'),
	Path = require('path');


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

exports.substitute = function(str, data) {
	return str.replace(/\{(\w+)\}/g, function(r, m) {
		return data[m] !== undefined && data[m] !== null ? 
				data[m] : '{' + m + '}';
	});
};


/**
 * 取得host相关的配置
 */
exports.hostConfig = function(config, req) {
	var result = exports.extend({}, config);
	delete result.hosts;

	var hosts = config.hosts || {},
		parts = req.headers.host.split(':'),
		host = parts[0],
		port = parts[1] || '';

	result.host = host;
	result.port = port;

	return exports.extend(result, hosts[host]);
};


/**
 *  解析buffer成字符串
 */
exports.decodeBuffer = function(buf) {
	if (!buf || typeof buf === 'string') {
		return buf;
	}

	var self = this,
		list = ['gbk', 'utf8'];
		
	for (var i = 0, c = list.length; i < c; i++) {
		var str = iconv.decode(buf, list[i]);
		if (str && str.indexOf('�') === -1) {
			return [str, list[i]];
		}
	}
};


/**
 * 并行取得多个url的内容
 * @param urls
 * @param {function({array<{ error: error, content: content}>})}
 */
exports.getUrlsContent = function(urls, fn) {
	var ret = [];
	ret.length = urls.length;
	
	var check = function() {
		for (var i = 0, c = ret.length; i < c; i++) {
			if (!ret[i]) {
				return false;
			}
		}
		return true;
	};
	
	urls.forEach(function(url, index) {
		exports.getUrlContent(url, function(e, data) {
			ret[index] = { error: e, content: data };
			check() && fn(ret);
		});
	});

};


/**
 * 取得url内容
 */
exports.getUrlContent = function(url, fn) {
	util.debug('get url content: ' + url);

	http.get(url, function(res) {
		if (res.statusCode === 404 || res.statusCode === 302) {
			util.error('get url content error: ' + url + '[' + res.statusCode + ']');
			var error = new Error('get url content error: ' + url);
			error.status = res.statusCode;
			return fn(error);
		}

		var list = [];
		res.on('data', function(data) {
			list.push(data);
		});

		res.on('end', function() {
			fn(null, Buffer.concat(list));
		});

	}).on('error', fn);
};


/**
 * 对输出流进行过滤
 */
exports.filter = function(req, res, next, type, fn) {
	var flag = null,
		list = [],
		write = res.write,
		end = res.end,
		count = 0;

	var check = function() {
		return '.' + type === req.fileext ||
			req.query.type === type;
	};

	res.write = function(chunk) {
		check() ? list.push(chunk) :
			write.apply(res, arguments);
	};

	res.end = function(chunk) {
		res.write = write;
		res.end = end;

		count++;
		if (count > 1) {
			return next(new Error('invalid call'));
		}

		if (!check()) {
			return end.apply(res, arguments);
		}

		chunk && list.push(chunk);
		if (!list.length) {
			return end.call(res)
		}
		
		fn(Buffer.concat(list));
	};

	next();
};
