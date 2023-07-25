# 安装 mysql

https://juejin.cn/post/6844904000152666126

# mysql 重置修改密码

https://blog.csdn.net/m0_46278037/article/details/113923726

# 报错 Error: Queue limit reached.

数据库连接超出规定数量，需要设置连接池的数量还有每次请求，在用完连接后需要使用 connection.release()进行返还连接，将连接不还给连接池，如果返还连接，最多连接 10 条就会崩溃。

```js
const pool = mysql.createPool({
  // 可选
  queueLimit: 1500,
  connectionLimit: 20, //连接数
});

//添加一个query方法
let query = function (sql, callBack) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return;
    }
    conn.query(sql, (err, data) => {
      conn.release(); //需要断开连接
      if (err) {
        console.log(err);
        return;
      }
      if (callBack) {
        callBack(data);
      }
    });
  });
};
```

# node.js 里面递归删除 sql 语句会造成一次请求有多个响应，从而使程序崩溃

<!-- 见menu菜单删除表 -->

这可能是因为在递归删除 SQL 语句时，程序出现了异步操作导致的问题。具体来说，在 Node.js 中，异步操作会通过回调函数或 Promise 进行处理
如果递归删除 SQL 语句使用了异步操作并且没有正确地处理每个异步操作的结果，那么程序就可能出现多个响应的情况。例如，如果递归删除 SQL 语句中的每个操作都返回一个 Promise 对象，并且没有正确地等待每个 Promise 执行完成，那么程序可能会在某些操作执行失败或超时时崩溃。
此外，还有可能是由于数据库的锁定机制导致的问题。如果多个请求同时对数据库进行操作，而其中某个请求正在删除数据，而其他请求需要等待该操作完成才能继续执行，那么这些请求就可能出现阻塞从而导致多个响应的情况。
解决这个问题的方法是确保在递归删除 SOL 语句时正确地处理异步操作的结果，并且避免多个请求同时对数据库进行操作。一种常见的做法是使用事务来确保在执行删除操作时不会被其他请求影响

# h5 history 模式 服务端配置

正常情况下，如果后端不配置前端也是可以正常使用 hash 模式进行匹配路由，只是还需要后台配置支持。因为我们的应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问 http://oursite.com/user/id 就会返回 404，或者在动态路由情况下再次刷新 404.其实只是多了个参数。所以呢，你要在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。服务端要做的就是不管匹配到什么路由都把 spa 单页面的 index.html 返回，然后有前端自行判断页面路由是否 404

# 关于请求传参类型问题

当 http 请求的 Content-Type: text/plain; charset=utf-8 时候，后端 node 需要使用该中间件过滤参数

```js
const bodyParser = require("body-parser");

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
// 反之使用erpress自带的
// app.use(express.urlencoded({ extended: false }))
```

# 用户登录 身份验证和 session 认证和 JWT 认证的 问题

相关文章：
https://github.com/alsotang/node-lessons/tree/master/lesson16
https://www.rstk.cn/news/1868.html?action=onClick

对于服务端渲染和前后端分离这两种开发模式来说，分别有着不同的身份认证方案：

- 服务端渲染推荐使用 Session 认证机制
- 前后端分离推荐使用 JWT 认证机制

## session

当使用 session 中间件后，会将成功登录后的用户信息存储在服务器内存中，同时返回客户端对应的字符串 cookie，后续通过客户端传来的 cookie 信息去服务器内存中查找客户信息

```js
/**
 * session
 *  secret：  一个 String 类型的字符串，作为服务器端生成 session 的签名
 *  name:    保存在本地cookie的一个名字 默认connect.sid  可以不设置
 *  resave:  强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。
 *  rolling: 在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
 *  saveUninitialized: 强制将未初始化的 session 存储。默认值是true,建议设置成true
 *
 * cookie
 *  属性默认值: { path: '/', httpOnly: true, secure: false, maxAge: null }
 *  httpOnly： 属性禁止客户端JavaScript的访问，禁止后不能使用document.cookie
 *  secure:    https这样的情况才可以访问cookie
 *  maxAge：   单位毫秒，从设置cookie开始多少毫秒失效(如果maxAge和expires都设置了，最后设置的属性生效.)
 *  path：     路径，默认值为域名的根路径
 *  sameSite:  SameSite-cookies是一种机制，用于定义cookie如何跨域发送。
 */
var session = require("express-session");
app.use(
  session({
    //配置信息，并调用
    secret: "sessiontest", //與cookieParser中的一致
    cookie: { maxAge: 10000 }, //这里就是设置了session的过期时间。
    //resave: false,
    //saveUninitialized: true
  })
);
// 存储session
app.post("/api/login", (req, res) => {
  // 判断用户提交的登录信息是否正确if (req.body.username !== 'admin' && req.body.password !== '000000') {return res.send({status: 1, msg: '登录失败'})}// 只有成功配置了 express-session 这个中间件之后，才能够获取到 req.sessionreg.session.user = req.body	//将用户的信息，存储到Session中req.session.islogin = true//将用户的登录状态，存储到Session中res.send({status: 0, msg: '登录成功'})
});
// 从Session中取数据
//获取用户姓名的接口
app.get("/api/username", (req, res) => {
  // 判断用户是否登录if (!req.session.islogin) {return res.send({status: 1, msg: 'fail'})}res.send({status: 0, msg: 'success', username: req.session.user.username})
});
// 清空从Session
app.post("/api/logout", (req, res) => {
  //清空当前客户端对应的session信息req.session.destroy()res.send({status: 0,m5g: '退出登录成功'})
});
```

## JWT 认证机制

JWT(英文全称：JSON Web Token)是目前最流行的跨域认证解决方案。用户的信息通过 Token 字符串的形式，保存在客户端浏览器中。服务器通过还原 Token 字符串的形式来认证用户的身份.

- 客户端发送账号密码到服务器
- 服务器验证账号密码，通过后将用户信息加密生成 token 字符串，返回给客户端
- 客户端把 token 存储本地缓存，再次请求接口时候把 token 信息存储在 Authorization 字段发送给服务器
- 服务器还原 token 字符串获取用户信息，再返回响应的资源

```js
// 导入用于生成 JWT 字符串的包
const jwt = require("jsonwebtoken");
// 导入用户将客户端发送过来的 JWT 字符串，解析还原成 JSON 对象的包
const expressJWT = require("express-jwt");
// 创建 express 的服务器实例
var secretKey = "dxg@^_^"; //定义 secret 密钥 * 这个 secretKey 的是可以是任意的字符串
app.use(expressJWT({ secret: secretKey }).unless({ path: [/^\/login\//] })); //可以通过 unless 配置接口白名单，也就是哪些 URL 可以不用经过校验，像登陆 / 注册都可以不用校验
```

### JWT 的退出登录方法

在使用 JSON Web 令牌时创建干净的注销流程并不那么简单，应该让 Token 保持活动状态，直到它自己过期为止；或者，如果你希望在用户注销时限制 Token 的使用，则选择储存一个 Token 黑名单。总而言之，只需遵循以下 4 个要点：

设置令牌的合理过期时间
注销时从客户端删除存储的 Token
拥有不再活动 Token 的数据库，这些 Token 仍有一些生存时间
针对每个请求根据黑名单查询授权情况

1. 黑名单校验
   凡是退出登录的 token 都放入黑名单中，定期清理。每次用户请求服务器都校验 token 是否在黑名单(redis 缓存)
2. 版本号校验
   访问时从 token 中取出版本号和用户 id 和 redis 中存储 用户 id 和版本号 做对比，不一致则不给访问。用户登出的时候在 redis 中把用户版本号加一。
3. 过期时间校验
   登录时 token 附带创建时间。访问时校验 redis 存储的过期时间，如果创建时间大于过期时间则不给访问。
4. 无为而治
   只让前端清理 token，后端不理会。（大多数）

## 报错 UnauthorizedError: Format is Authorization: Bearer [token]

希望客户端给服务器传过来的 token 是 Bearer xxx.xxx.xxx 这样的形式。否则以下代码中会报错：Format is Authorization: Bearer [token]

```js
// 需要在请求头中配置格式
if (getLocal("token")) {
  config.headers.Authorization = "Bearer " + getLocal("token");
}
```

## redis

使用 redis 必须先开启服务，否则报错。

安装说明 http://mrdede.com/?p=2582
基本操作 https://www.cnblogs.com/zhaowinter/p/10776868.html

# 文件管理

## 后端接收文件

https://blog.csdn.net/weixin_39168678/article/details/118936835
前端传输文件一般采用 formdata 的格式，所以服务端的核心在于怎样去解析 formdata 格式的数据，目前比较流行的解析插件主要有 multiparty 与 busboy ，这里还是采用大多数的 multiparty
https://github.com/pillarjs/multiparty
https://www.cnblogs.com/wangyinqian/p/7811719.html

```js
npm install multiparty
```
