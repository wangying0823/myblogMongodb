const marked = require('marked'); //  markdown 解析文章的内容
const Post = require('../lib/mongo').Post;
const CommentModel = require('./comments');
// 我们在 PostModel 上注册了 contentToHtml，而 addCreatedAt 是在 lib/mongo.js 中 mongolass 上注册的。也就是说 contentToHtml 只针对 PostModel 有效，而 addCreatedAt 对所有 Model 都有效。
Post.plugin('contentToHtml',{
  afterFind: function (posts){
    return posts.map(function(post){
      post.content=marked(post.content)
      return post;
    })
  },
  afterFindOne: function(post){
    if(post){
      post.content = marked(post.content)
    }
    return post
  }
})
// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount',{
  afterFind: function(posts){
    return Promise.all(posts.map(function(post){
      return CommentModel.getCommentsCount(post._id).then(function(commentsCount){
        post.commentsCount = commentsCount;
        return post;
      })
    }))
  },
  afterFindOne: function(post){
   if(post){
    return CommentModel.getCommentsCount(post._id).then(function(commentsCount){
      post.commentsCount = commentsCount;
      return post;
    })
   }
   return post;
  }
})
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
module.exports = {
  // 创建一篇文章
  create: function create(post){
    return Post.create(post).exec();
  },
  // 通过文章id获取一篇文章
  getPostById: function getPostById(postId){
    return Post.findOne({_id: postId}).populate({path:'author',model: 'User'}).addCreatedAt().addCommentsCount().contentToHtml().exec()
  },
  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author){
    const query = {};
    if(author){
      query.author = author;
    }
    return Post.find(query).populate({path:'author',model: 'User'}).sort({ _id: -1 }).addCreatedAt().addCommentsCount().contentToHtml().exec()
  },
  // 通过文章 id 给 pv 加 1  更新
  incPv: function incPv(postId){
    return Post.update({_id:postId},{$inc:{pv:1}}).exec()
  },
  // 通过文章 id 获取一篇原生文章（编辑文章）
  // 我们通过新函数 getRawPostById 用来获取文章原生的内容（编辑页面用），而不是用 getPostById 返回将 markdown 转换成 html 后的内容
  getRawPostById: function getRawPostById(postId){
    return Post.findOne({_id: postId}).populate({path: 'author', model: 'User'}).exec()
  },
  // 通过文章 id 更新一篇文章 更新
  updatePostById: function updatePostById(postId, data){
    return Post.update({_id: postId}, {$set: data}).exec();
  },
  // 通过文章 id 删除一篇文章 删除
  delPostById: function delPostById(postId){
    return Post.deleteOne({_id: postId}).exec().then(function(res){
      // 文章删除后，再删除该文章下的所有留言
      if(res.result.ok && res.result.n > 0){
        return CommentModel.delCommentsByPostId(postId)
      }
    })
  }
}