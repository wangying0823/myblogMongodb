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
// --------------------------------------------------------------------------------------------------------
// MongoDB 增删改查/查总条数/限制返回的条数
// insert = 插入 create = 创建 deleteOne = 删除单个 deleteMany = 删除多个 update = 更新 findOne = 查单个 find = 查多个(对象{})
// count = 查总条数 limit = 限制返回的条数
// 条件操作符
// 大小比较操作符: < = 小于, <= = 小于等于, > = 大于, >= = 大于等于
   示例：db.collection.find({ "field" : { $gt: value1, $lt: value2 } } ); // value1 < field < value2
// $all匹配所有: $all 必须满足[ ]内的所有值
   示例： 可以查询出：{name: 'David', age: 26, age: [ 6, 8, 9 ] } 但查询不出：{name: 'David', age: 26, age: [ 6, 7, 9 ] }
// $exists判断字段是否存在: 
   示例：查询所有存在age 字段的记录 db.users.find({age: {$exists: true}});
   查询所有不存在name 字段的记录 db.users.find({name: {$exists: false}});
// Null空值处理:
   示例：在users文档找出"sex"值为"null"并且字段存在的记录 db.users.find({sex:{"$in":[null], "$exists":true}});
// $mod取模运算:
   示例：查询age 取模10 等于0 的数据 db.student.find( { age: { $mod : [ 10 , 0 ] } } )
// $ne不等于:
   示例：查询x 的值不等于3 的数据 db.things.find( { x : { $ne : 3 } } );
// $in包含:
   示例：查询x 的值在2,4,6 范围内的数据：db.things.find({x:{$in: [2,4,6]}});
// $nin 不包含:
   示例：查询x 的值在2,4,6 范围外的数据：db.things.find({x:{$nin: [2,4,6]}});
// $size数组元素个数:
   示例：$size对于查询数组来说是非常有用的，顾名思义，可以用它查询特定长度的数组。例如：db.users.find({favorite_number: {$size: 3}})
   对于记录 {name: 'David', age: 26, favorite_number: [ 6, 7, 9 ] }
// $regex正则表达式匹配:
   示例：查询name字段以B开头的记录 db.users.find({name: {$regex: /^B.*/}});
// javascript查询和$where查询:
   示例：db.c1.find( { a : { $gt: 3 } } ); db.c1.find( { $where: "this.a > 3" } ); db.c1.find("this.a > 3"); 
   f = function() { return this.a > 3; } db.c1.find(f);
// count查询记录条数:
   示例：使用count()方法查询表中的记录条数，例如，下面的命令查询表users的记录数量：db.users.find().count();
// --------------------------------------------------------------------------------------------------------
// MongoDB 游标
  next遍历游标：
  示例：for( var c = db.t3.find(); c.hasNext(); ) {
         printjson( c.next());
       }
  forEach遍历游标：
  示例：db.t3.find().forEach( function(u) { printjson(u); } );
  limit限制结果数量：
  示例：db.c.find().limit(3)
  skip限制返回记录的起点：
  示例：db.users.find().skip(3).limit(5); 从第3 条记录开始，返回5 条记录(limit 3, 5)
  sort排序结果：
  示例：以年龄升序（asc）排列：db.users.find().sort({age: 1});
       以年龄降序（desc）排列：db.users.find().sort({age: -1});
// --------------------------------------------------------------------------------------------------------
// MongoDB 原子操作常用命令
// $set 用来指定一个键并更新键值，若键不存在并创建。
// $unset 用来删除一个键。
// $inc $inc可以对文档的某个值为数字型（只能为满足要求的数字）的键进行增减的操作。
// $push 把value追加到field里面去，field一定要是数组类型才行，如果field不存在，会新增一个数组类型加进去。
// $pushAll 同$push,只是一次可以追加多个值到一个数组字段内。
// $pull 从数组field内删除一个等于value值。
// $addToSet 增加一个值到数组内，而且只有当这个值不在数组内才增加。
// $pop 删除数组的第一个或最后一个元素
// $rename 修改字段名称
// $bit 位操作，integer类型
// --------------------------------------------------------------------------------------------------------
// .gitignore
// 如果我们想把项目托管到 git 服务器上（如: GitHub），而不想把线上配置、本地调试的 logs 以及 node_modules 添加到 git 的版本控制中，这个时候就需要 .gitignore 文件了，git 会读取 .gitignore 并忽略这些文件。在 myblog 下新建 .gitignore 文件，添加如下配置：
config/*
!config/default.*
npm-debug.log
node_modules
coverage
然后在 public/img 目录下创建 .gitignore：
# Ignore everything in this directory
*
# Except this file
!.gitignore
这样 git 会忽略 public/img 目录下所有上传的头像，而不忽略 public/img 目录。同理，在 logs 目录下创建 .gitignore 忽略日志文件：
# Ignore everything in this directory
*
# Except this file
!.gitignore