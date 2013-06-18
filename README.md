fd-server
=========

用于代替apache，以更轻量级的方式搭建style本地开发环境。提供 less编译、style combine、url rewrite等等功能，并具有良好的扩展性。

## 使用

1\. git clone git://github.com/fangdeng/fdserver.git
2\. cd fdserver
3\. npm install
4\. cp config.js.sample config.js
5\. 修改config.js
6\. sudo node bin/fdserver
