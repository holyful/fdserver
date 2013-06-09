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
					to: '{root}/styleoffer/$1'
				},

				{
					from: '^/app/butterfly/(.*)$',
					to: '{root}/butterfly/$1'
				}

			]
		}
	}
};
