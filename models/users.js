const User = require('../lib/mongo').User;
module.exports = {
  // 注册一个新用户 增加
  create: function create(user){
    return User.create(user).exec();
  },
  // 通过用户名获取用户信息 查询
  // addCreatedAt 自定义插件（通过 _id 生成时间戳）
  getUserByName: function getUserByName(name){
    return User.findOne({name: name}).addCreatedAt().exec();
  }
}