module.exports = {
  port: 2003, // 程序启动要监听的端口号
  session: { // express-session 的配置信息
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/myblog' // mongodb 的地址，以 mongodb:// 协议开头，myblog 为 db 名
}