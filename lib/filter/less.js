/**
 * less支持
 */

var Path = require('path'),
	utils = require('../utils'),
	iconv = require('iconv-lite');


var ERROR_TPL =  
[
'body:before {',
'	content: \'{0}\';',
'	font-size: 40px;',
'	color: #f00;',
'}'
].join('');


module.exports = function(req, res, next) {
	if (Path.extname(req.url) === '.less') {
		res.setHeader('Content-Type', 'text/css');
		proxy(req, res, next);
	}

	next();
};


function proxy(req, res, next) {
	var end = res.end,
		list = [];

	res.write = function(chunk) {
		list.push(chunk);
	};

	res.end = function(chunk) {
		chunk && list.push(chunk);

		if (!list.length) {
			return end.call(res, '');
		}

		var info = utils.decodeBuffer(Buffer.concat(list)),
			less = info[0],
			encoding = info[1],
			opts = getOptions(req);
		
		parse(less, opts, function(css) {
			var buf = iconv.encode(css, encoding);
			res.setHeader('Content-Length', buf.length);
			end.call(res, buf);
		});
	};
}


function parse(less, opts, fn) {
	var Parser = require('less').Parser,
		parser = new Parser(opts);

	parser.parse(less, function(ex, tree) {
		var css = '';
		if (!ex) {
			try {
				css = tree.toCSS();
			} catch (e) {
				ex = e;
			}
		}

		if (ex) {
			css = JSON.stringify(ex).replace(/\s/g, ' ');
			css = utils.substitute(ERROR_TPL, [css]);
		}

		fn(css);
	});
}


function getOptions(req) {
	var root = req.config.root || '.',
		dir = Path.dirname(req.url);

	return {
		paths: [root, Path.join(root, dir)],
		filename: Path.basename(req.url)
	};
}

