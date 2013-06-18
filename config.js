module.exports = {
	// port: 80,
	// logger: 'default',

	hosts: {
		'webroot': {
			root: '/Users/bencode/webroot'
		},

		'style.c.aliimg.com': {
			root: '/Users/bencode/webroot/styles',
			merge: true,
			rewrite: [
				{
					from: '^/app/offer/(.*)$',
					to: 'styleoffer/$1'
				},

				{
					from: /^\/app\/butterfly\/(.*)\.css\b/,
					to: 'butterfly/$1.less'
				},

				{
					from: '^/app/butterfly/(.*)$',
					to: 'butterfly/$1'
				}

			]
		}
	}
};
