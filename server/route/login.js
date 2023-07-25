const express = require("express");
const router = express.Router();
const { login } = require("../controller/sys/login");


// 登录接口
router.post("/login", function (req, res) {
  
  //将 req.body 请求体中的数据，转存为 userinfo 常量
  const userinfo = req.body;

  var { username, password } = userinfo;
  try {
    login(username, password, (r) => {
      if (r.error) {
        res.status(r.error.status).json({ success: false, error: r.error.msg });
      }
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "该用户不存在" });
  }
});

module.exports = router;
