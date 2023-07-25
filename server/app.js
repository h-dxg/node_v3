// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()
const path = require("path");
const fs = require("fs");
const history = require('connect-history-api-fallback');//前端路由history模式
const apiRouter = require('./route/index.js') //路由管理
const router = express.Router();

const bodyParser = require('body-parser')
const { verToken, secretKey } = require('./utils/token')
// An highlighted block
require('events').EventEmitter.defaultMaxListeners = 0;

const expressJWT = require("express-jwt");
const hostname = 'localhost';
const port = 8765;
app.use(history())
// app.use(express.static('dist'))

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  // res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  //获取请求url的路径
  // let { pathname } = new URL(req.url, 'http://127.0.0.1');
  // console.log(pathname, 'pathname');

  next();
  // if (req.method == 'OPTIONS') {
  //   res.send(200);
  //   /make the require of options turn back quickly/
  // } else {
  //   next();
  // }
});
app.use((req, res, next) => {
  var token = req.headers['authorization']
  if (token == undefined) {
    return next()
  } else {
    verToken(token)
      .then((data) => {
        req.data = data //获取存储用户信息
        // console.log(req.data, '  req.data');
        return next()
      })
      .catch((error) => {
        console.log(error);
        return res.status(401).json(error);

      })
  }
});
app.use(expressJWT({ secret: secretKey }).unless({ path: '/api/login/login' })); //可以通过 unless 配置接口白名单，也就是哪些 URL 可以不用经过校验，像登陆 / 注册都可以不用校验
// app.use(express.urlencoded({ extended: false }))
// 解析 application/json
app.use(bodyParser.json());


app.listen(port, () => {
  console.log("\033[1;31;40m服务器启动:Server running at:\033[0m", `: http://${hostname}:${port}/!`);
});

// 接口代理api
app.use('/api', apiRouter);



/**
 *
 * 　　　┏┓　　　┏┓
 * 　　┏┛┻━━━┛┻┓
 * 　　┃　　　　　　　┃
 * 　　┃　　　━　　　┃
 * 　　┃　┳┛　┗┳　┃
 * 　　┃　　　　　　　┃
 * 　　┃　　　┻　　　┃
 * 　　┃　　　　　　　┃
 * 　　┗━┓　　　┏━┛Code is far away from bug with the animal protecting
 * 　　　　┃　　　┃    神兽保佑,代码无bug
 * 　　　　┃　　　┃
 * 　　　　┃　　　┗━━━┓
 * 　　　　┃　　　　　 ┣┓
 * 　　　　┃　　　　 ┏┛
 * 　　　　┗┓┓┏━┳┓┏┛
 * 　　　　　┃┫┫　┃┫┫
 * 　　　　　┗┻┛　┗┻┛
 *
 */
module.exports = app