//数据库操作封装
const db = require("../../common");
const { setToken } = require('../../utils/token')



const login = (username, password, callback) => {
  db.query(
    `select * from user where user_name = '${username}' and login_password = '${password}' `,
    (data) => {
      try {
        let dataw = data[0];
        let str = {
          id: dataw.user_id,
          username,
          roleIds: dataw.roleIds,
          loginName: dataw.loginName
        }
        if (dataw.login_password === password) {
          // 在登录成功之后，调用 jwt.sign() 方法生成 JWT 字符串。并通过 token 属性发送给客户端
          setToken(str).then((tokenStr) => {
            var r = {
              msg: "登录成功",
              status: 200,
              token: tokenStr,
            };
            callback(JSON.stringify(r));
          }).catch((error) => {
            console.log(error, "error");
          })

        } else {
          callback({ msg: "密码不正确", status: 400 });
        }
      } catch (error) {
        // console.log(error, "error");
        callback({ error: { msg: "该用户不存在", status: 500 } });
      }
    }
  );
};

module.exports = {
  login,
};
