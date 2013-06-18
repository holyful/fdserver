/**
 * less支持
 */

var Path = require('path'),
	fs = require('fs'),
	util = require('util'),
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
	// disable cache
	delete req.headers['if-none-match'];
	delete req.headers['if-modified-since'];

	var end = res.end;
	utils.filter(req, res, next, '.less', function(data) {
		var info = utils.decodeBuffer(data),
			less = info[0],
			encoding = info[1],
			opts = getOptions(req);

		parse(less, opts, function(css) {
			var buf = iconv.encode(css, encoding);
			res.setHeader('Content-Type', 'text/css');
			res.setHeader('Content-Length', buf.length);

			end.call(res, buf);
			tryOutput(req, buf);
		});

	});
};


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


function tryOutput(req, buf) {
	var path = req.filepath;
	if (!path) {
		return;
	}

	path = Path.join(Path.dirname(path), 
			Path.basename(path, '.less') + '.css');
	
	fs.exists(path, function(exists) {
		if (!exists) {
			return;
		}

		util.debug('write css file: ' + path);
		fs.writeFile(path, buf, function(e) {
			e && util.error(e);
		});

	});
}
