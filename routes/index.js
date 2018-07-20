module.exports = function(app) {
  app.get('/',function(req, res){
    res.redirect('/posts'); //重定向
  })
  app.use('/signup', require('./signup')) // 注册
  app.use('/signin', require('./signin')) // 登录
  app.use('/signout', require('./signout')) // 登出
  app.use('/posts', require('./posts')) // 动态
  app.use('/comments', require('./comments')) // 评论
  // 404 page
  app.use(function(req,res){
    if(!res.headersSent){ //检查 HTTP 标头是否已被发送以及在哪里被发送。 如果报头已发送，则返回 true，否则返回 false。
      res.status(404).render('404')
    }
  })
}