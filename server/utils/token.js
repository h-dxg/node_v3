// 导入用于生成 JWT 字符串的包
const jwt = require("jsonwebtoken");
// 创建 express 的服务器实例
var secretKey = "dxg@^_^"; //定义 secret 密钥 * 这个 secretKey 的是可以是任意的字符串


exports.setToken = (data) => {
  return new Promise((resolve, reject) => {
    const token = jwt.sign(
      data,
      secretKey,
      {
        expiresIn: "30000s", //设置过期时间
        algorithm: 'HS256', // 算法
      }
    )
    resolve(token)
  })
}

exports.verToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
      if (err) {
        console.log(err.name, 'errerrerr');
        console.log(err);
        if (err.name == 'TokenExpiredError') {//token过期
          let str = {
            iat: 1,
            exp: 0,
            msg: 'token过期'
          }
          reject(str)
        } else if (err.name == 'JsonWebTokenError') {//无效的token
          let str = {
            iat: 1,
            exp: 0,
            msg: '无效的token'
          }
          reject(str)
        }
      } else {
        resolve(decoded)
      }
    })
  })
}

exports.secretKey = secretKey