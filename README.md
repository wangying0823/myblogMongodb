// 目录结构

// config: 默认配置

// middlewares: 中间件(权限控制)

// component: 公用组件

// lib: mongodb

// models: 存放操作数据库的文件

// public: 存放静态文件，如样式、图片等

// routes: 存放路由文件

// views: 存放模板文件

// index.js: 程序主文件


// 插件

// express: web 框架

// express-session: session 中间件

// connect-mongo: 将 session 存储于 mongodb，结合 express-session 使用

// connect-flash: 页面通知的中间件，基于 session 实现

// ejs: 模板

// express-formidable: 接收表单及文件上传的中间件

// config-lite: 读取配置文件

// marked: markdown 解析

// moment: 时间格式化

// mongolass: mongodb 驱动

// objectid-to-timestamp: 根据 ObjectId 生成时间戳

// sha1: sha1 加密，用于密码加密

// winston: 日志

// express-winston: express 的 winston 日志中间件


// 实现功能

注册

  注册页：GET /signup

  注册（包含上传头像）：POST /signup
  
登录

  登录页：GET /signin
  
  登录：POST /signin
  
  登出：GET /signout
  
查看文章

  主页：GET /posts
  
  个人主页：GET /posts?author=xxx
  
  查看一篇文章（包含留言）：GET /posts/:postId
  
发表文章

  发表文章页：GET /posts/create
  
  发表文章：POST /posts/create
  
修改文章

  修改文章页：GET /posts/:postId/edit
  
  修改文章：POST /posts/:postId/edit
  
  删除文章：GET /posts/:postId/remove
  
留言

  创建留言：POST /comments
  
  删除留言：GET /comments/:commentId/remove

// Restful

Restful 是一种 api 的设计风格，提出了一组 api 的设计原则和约束条件。

如上面删除文章的路由设计：

GET /posts/:postId/remove

Restful 风格的设计：

DELETE /posts/:postId

// session

由于 HTTP 协议是无状态的协议，所以服务端需要记录用户的状态时，就需要用某种机制来识别具体的用户，这个机制就是会话（Session）。

cookie 与 session 的区别

cookie 存储在浏览器（有大小限制），session 存储在服务端（没有大小限制）

通常 session 的实现是基于 cookie 的，session id 存储于 cookie 中

session 更安全，cookie 可以直接在浏览器查看甚至编辑

我们通过引入 express-session 中间件实现对会话的支持：app.use(session(options))

session 中间件会在 req 上添加 session 对象，即 req.session 初始值为 {}，当我们登录后设置 req.session.user = 用户信息，返回浏览器的头信息中会带上 set-cookie 将 session id 写到浏览器 cookie 中，那么该用户下次请求时，通过带上来的 cookie 中的 session id 我们就可以查找到该用户，并将用户信息保存到 req.session.user。

// connect-flash

connect-flash 是基于 session 实现的，它的原理很简单：设置初始值 req.session.flash={}，通过 req.flash(name, value) 设置这个对象下的字段和值，通过 req.flash(name) 获取这个对象下的值，同时删除这个字段，实现了只显示一次刷新后消失的功能

express-session、connect-mongo 和 connect-flash 的区别与联系

express-session: 会话（session）支持中间件

connect-mongo: 将 session 存储于 mongodb，需结合 express-session 使用，我们也可以将 session 存储于 redis，如 connect-redis

connect-flash: 基于 session 实现的用于通知功能的中间件，需结合 express-session 使用

// app.locals 和 res.locals

app.locals 上通常挂载常量信息（如博客名、描述、作者这种不会变的信息）

res.locals 上通常挂载变量信息，即每次请求可能的值都不一样（如请求者信息，res.locals.user = req.session.user）
