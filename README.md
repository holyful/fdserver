fd-server 0.6.1
===============

fd-server是一个使用node js开发的服务器

开发工程师可以使用它来代替apache搭建更轻量级的前端开发环境

它是基于[connect模块](http://www.senchalabs.org/connect/)开发的，所有的组件都以中间件的方式进行开发，因此很容易进行扩展。

它不仅仅是一个服务器，我们会在此基础上扩展很多工具或插件，从而让我们的开发变得更快捷和高效。


## 使用

1. git clone git://github.com/fangdeng/fdserver.git
2. cd fdserver
3. npm install
4. cp config.js.sample config.js
5. 修改config.js
6. sudo node bin/fdserver

[注] 

由于默认是运行在80端口上，所以需要管理员权限

win下启动有少许差异，请自行调整


## 特性

1. host - 多host支持
2. rewrte - url rewrite
3. merge - merge文件预合并
4. less - less开发的支持
5. concat - tengine concat 协议支持
6. delay - 资源延迟返回
7. jade - jade模板格式支持
8. markdown - markdown格式支持

## 即将支持

1. 可视化配置
2. 小米模板开发支持
3. 类似fiddler autoresponse支持
4. fdlint自动描扫

## 模块配置和说明

### 通用

### host

### rewrite

### merge

### less

### concat

### delay

### jade

### markdown


## 扩展和开发
