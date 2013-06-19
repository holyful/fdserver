fd-server 0.6.1
===============

fd-server是一个使用node js开发的服务器

开发工程师可以使用它来代替apache搭建更轻量级的前端开发环境

它是基于[connect模块](http://www.senchalabs.org/connect/)开发的，所有的组件都以中间件的方式进行开发，因此很容易进行扩展。

它不仅仅是一个服务器，我们会在此基础上扩展很多工具和插件，从而让我们的开发变得更快捷和高效。

你也可以在上面随意写写nodejs代码来扩展一些有意思的功能，整天开发客户端代码也够无聊的 (^_^)


## 使用方法

在使用之前需要你的机子安装node环境，然后进行以下步骤

1. git clone git://github.com/fangdeng/fdserver.git
2. cd fdserver
3. npm install
4. cp config.js.sample config.js
5. 修改config.js
6. sudo node bin/fdserver

[注] 

1. 默认是运行在80端口上，所以需要管理员权限
2. win下启动有少许差异，请自行调整
3. config.js.sample是配置示例文件，需要重命名为 config.js修改成适合您的情况才能运行
4. 后续会提供在线配置界面


## 已支持特性

1. host		- 多host支持
2. rewrte	- url rewrite
3. merge	- merge文件预合并
4. less		- less开发的支持
5. concat	- tengine concat和小米concat协议支持
6. delay	- 资源延迟返回
7. jade		- jade模板格式支持
8. markdown	- markdown格式支持

## 将支持特性

1. 可视化配置
2. autoresponse支持
3. sass支持
4. fdlint自动描扫描


## 配置和说明

通过配置config.js来使用服务器

config.js是一个普通的js文件，因此你可以在里面书写任意的js代码

### 通用

#### logger

日志配置，可以参考 [Logger](http://www.senchalabs.org/connect/logger.html) 配置

默认为'default'

#### port

端口号，默认为80

### host

可以独立配置多个host

	{
		// 全局配置
		...

		hosts: {
			'style.c.aliimg.com': {
				root: '/Users/bencode/webroot/styles'
			},

			'assets.1688.com': {
				root: '/Users/bencode/webroot/static_site'
			}

			...
		}
	}

如上例配置了两个host, 每个host的root配置成资源目录

[注] 路径需要以 / 分隔


### rewrite

通过rewrite可以配置一些重写规则

这里的rewrite实现的比较简单，暂时没有apache那么强大的功能

但应该满足我们日常的开发需求

例

	{
		hosts: {

			'style.c.aliimg.com': {

				root: '/Users/bencode/webroot/styles',

				rewrite: [
				{
					from: '^/app/offer/(.*)$',
					to: 'styleoffer/$1'
				},

				{
					from: '^/app/butterfly/(.*)$',
					to: 'butterfly/$1'
				},

				{
					from: '^(.*)$',
					to: 'http://110.75.196.23$1'
				}
				]
			}
		}
	}

1. rewrite 需要配置成一个数组，每个数组元素是一个对象
2. 每个rewrite对象需要指定 from 和 to 属性
3. from是一个正则式，可以以字符串形式指定，也可以使用js的正则式语法
4. to表示要重写的目标位置。可以是 http://地址，也可以是本地地址。本地地址可以是相对于root，也可以是绝对地址
5. to中可以使用正则表达式的替换符，如 $1, $2, 也可以使用配置信息替换符，如 {root}, {host}, {port}等
6. 只有当目标位置存在时，重写规则才生效。暂时没有对url目标重写做存在检测，后续可能会加404检测。
7. rewrite规则按顺序执行


上例配置了3条rewrite规则:

1. 对于 http://style.c.aliimg.com/app/offer/... 下的文件，重定向到 /Users/bencode/webroot/styles/styleoffer/...
2. 对于 http://style.c.aliimg.com/app/butterfly/... 下的文件，重定向到 /Users/bencode/webroot/styles/butterfly/...
3. 如果还是找不到，最后到 http://110.75.196.23上去抓取

[注] 

默认情况下，只有文件直接在本地找不到时，才会使用rewrite规则
	
因为默认的文件访问是使用 host filter进行的，而host filter排在rewrite filter之前

请参考 filters.js


### merge

merge文件实时编译

如果配置

	{
		hosts: {
			'style.c.aliimg.com': {
				root: ...,

				merge: true
			}
		}
	}

则js/css符合merge文件格式时，会返回merge后的结果文件

因为有些页面在没merge时，可能不能正常工作，可以开启这个选项来开发。

### less

less文件进行实时编译

1. 如果访问less文件时，则会自动编译less文件，并返回css输出
2. 如果访问css文件时，在对应位置有less文件时，则读取此less文件，并编译成css文件输出
3. 如果less文件对应位置有css文件，则编译好less文件后，会将css代码写回已存在的css文件，达到自动更新功能。如果css文件不存在，则不进行写操作。
4. 可以指定 less 选项，可参考 [Less中文文档](http://www.lesscss.net/) 

例

	{
		hosts: {
			'style.c.aliimg.com': {
				less: {
					...
				}
			}
		}
	}

[注] 

如果原css文件的访问需要url rewrite，则对less的支持也需要url rewrite支持

例：

	'style.c.aliimg.com': {
		root: '/Users/bencode/webroot/styles',
		merge: true,
		rewrite: [
			{
				from: /^\/app\/butterfly\/(.*)\.css\b/,
				to: 'butterfly/$1.less'
			},

			{
				from: '^/app/butterfly/(.*)$',
				to: 'butterfly/$1'
			}
		]
	...

以上将 app/butterfly/.../some.css 重写向成 app/butterfly/.../some.less以提供对less的支持


### concat

支持tengine concat协议和小米模块concat协议

即能够理解下面两种形式的url

http://assets.1688.com??css/ui/form.css,css/ui/table.css...

和

http://cdn.c.aliimg.com/css/ui/form|css/ui/table|...|css/ui/tab.css

默认情况下，url中的资源会被请求，然后返回合并后的文件

如果配置参数 concatSplit: true, 则会仅仅输出他们的引用，这样在调试时可能会更方便

如指定了 concatSplit: true, 则会得到类似以下输出:

	@import url(http://style.c.aliimg.com/sys/css/universal/masthead/industry-v1-min.css);
	@import url(http://style.c.aliimg.com/fdevlib/css/fdev-v4/editor/editor-min.css);
	@import url(http://style.c.aliimg.com/fdevlib/css/fdev-v4/core/fdev-flying.css);


### delay

如果配置了 delay: true

则对相应资源的访问可以延迟指定时间返回。

如访问 http://style.c.aliimg.com/app/butterfly/js/lang/class.js?delay=2

则过2s才返回这个url的内容

### jade

支持jade 模板文件的解析

如果访问的文件后缀为 .jade 或者 url带有参数 ?type=jade，则会解析内容成html代码

可以指定参数 jade来配置 jade parser

参考文档 [jade readme](https://github.com/visionmedia/jade#readme)


### markdown

支持markdown文件的解析

如果访问的文件后缀为 .md 或者 url带有参数 ?type=md, 则会解析内容成html代码

可以指定参数 markdown来配置 markdown parser

参考文档 [markdown](https://github.com/evilstreak/markdown-js)


## 扩展和开发

1. 可以参考 lib/filter包下面的示例进行开发
2. 每个filter都是一个connect中间件, 参考文档 [Connect](http://www.senchalabs.org/connect/logger.html)
3. 请安装node-dev，这样在开发时，可以在文件修改后自动重启服务器
4. 默认启动时，会启动多个子进程，可以加-d选项，在开发时只启动一个进程，以更方便调试

