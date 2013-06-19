/**
 * 支持app开发的特殊rewrite规则
 */

var fs = require('fs'),
	Path = require('path');


exports.prepare = function(config) {
	var app = config.app,
		rewrite = config.rewrite || [];

	app && rewriteApp(app, rewrite);

	// less support
	rewrite.push({
		from: /\.css\b/,
		to: '.less'
	});

	config.remote && rewrite.push(
	{
		from: '^(.*)$',
		to: config.remote + '$1'
	});

	config.rewrite = rewrite;
};


function rewriteApp(app, rewrite) {
	var stat = fs.statSync(app);
	if (!stat.isDirectory()) {
		return ret;
	}

	var dirs = fs.readdirSync(app);
	for (var i = 0; i < dirs.length; i++) {
		var dir = dirs[i],
			path = Path.join(app, dir);
		if (/^[-\w]+$/.test(dir) && fs.statSync(path).isDirectory()) {
			rewriteItem(rewrite, dir);
		}
	}
}


function rewriteItem(rewrite, dir) {
	var o = {
//app/appName/version/modes/mode/file
'^/app/([^/]+)/([^/]+)/modes/([^/]+)/(.*)$': '{app}/' + dir + '/apps/$1/resources/modes/$3/$4',

//app/appName/version/js|css/...
'^/app/([^/]+)/([^/]+)/(js|css)/([^?]+).*$': '{app}/' + dir + '/apps/$1/resources/modes/view/$3/$4',

//app/appName/version/[templates]/view.js|edit.js,
'^/app/([^/]+)/([^/]+)/((view|edit)\.(js|css|less)).*$': '{app}/' + dir + '/apps/$1/resources/modes/$4/$3',
'^/app/([^/]+)/([^/]+)/([^/]+)/((view|edit)\.(js|css|less)).*$': '{app}/' + dir + '/apps/$1/templates/$3/resources/modes/$5/$4'

	};

	for (var k in o) {
		rewrite.push({
			from: k,
			to: o[k]
		});
	}
}

