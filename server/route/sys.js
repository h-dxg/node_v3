const express = require("express");
const router = express.Router();
const {
  userList,
  userInfo,
  userAdd,
  userDel,
  userUpdate,
  getMenus
} = require("../controller/sys/user");
const {
  roleList,
  roleAdd,
  roleUpdate,
  roleDel,
  roleUserAdd,
  roleUserList,
  roleUserDel
} = require("../controller/sys/role");
const {
  menuAdd,
  menuList,
  menuUpdate,
  menuDel,
} = require("../controller/sys/menu");

// // 首页获取菜单权限接口
router.get('/user/getMenus', function (req, res) {
  try {
    getMenus(req, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "权限菜单获取失败" });
  }
})
//**user
// 查询用户
router.get("/user/userlist", function (req, res) {
  // console.log(req.query, "reqreqreqreq");
  // count 每页条数
  // page 页数
  const { count, page } = req.query;
  try {
    userList(count, page, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// 获取用户详情
router.get("/user/userInfo", function (req, res) {
  console.log(req.query.id, "reqreqreqreq用户详情");
  try {
    userInfo(req.query.id, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});

// 新增用户
router.post("/user/userAdd", function (req, res) {
  const userinfo = req.body;
  console.log(userinfo, "userinfo");
  try {
    userAdd(userinfo, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// 删除用户
router.delete("/user/userDel", function (req, res) {
  const query = req.query;
  try {
    userDel(query, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// 编辑用户
router.post("/user/userUpdate", function (req, res) {
  const data = req.body;
  try {
    userUpdate(data, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
//**role
// 查询角色
router.get("/role/rolelist", function (req, res) {
  // console.log(req.query, "reqreqreqreq");
  // count 每页条数
  // page 页数
  const { count, page } = req.query;
  try {
    roleList(count, page, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// 查询单个详情
router.get("/role/queryById", function (req, res) {
  // console.log(req.query, "reqreqreqreq");
  const params = req.query;
  try {
    roleList(params, null, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// // 新增角色
router.post("/role/roleAdd", function (req, res) {
  const userinfo = req.body;
  try {
    roleAdd(userinfo, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// // 删除角色
router.delete("/role/roleDel", function (req, res) {
  const query = req.query;
  try {
    roleDel(query, (r) => {
      if (r.status === 500) {
        res.status(500).json({ success: false, error: res.msg });
      } else {
        res.send("删除成功");
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// // 编辑角色
router.post("/role/roleUpdate", function (req, res) {
  const data = req.body;
  try {
    roleUpdate(data, (r) => {
      if (r.error) {
        res.status(500).json({ success: false, error: r.error });
      } else {
        res.send(r);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
//角色人员新增
router.post("/role/user/add", function (req, res) {
  const data = req.body;
  try {
    roleUserAdd(data, (r) => {
      if (r.error) {
        res.status(500).json({ success: false, error: r.error });
      } else {
        res.send(r);
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
//查询角色人员
router.get("/role/user/list", function (req, res) {
  try {
    roleUserList(req.query, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "查询失败" });
  }
});
//删除角色人员
router.delete("/role/user/del", function (req, res) {
  const query = req.query;
  try {
    roleUserDel(query, () => {
      res.send("删除成功");
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});

//**menu 菜单
// 查询菜单
router.get("/menu/menulist", function (req, res) {
  try {
    menuList(req.query, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "查询失败" });
  }
});
// 新增菜单
router.post("/menu/menuAdd", function (req, res) {
  const userinfo = req.body;
  console.log(userinfo, "userinfo");
  try {
    menuAdd(userinfo, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});
// 修改菜单
router.post("/menu/menuUpdate", function (req, res) {
  const userinfo = req.body;
  try {
    menuUpdate(userinfo, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});
// // 删除菜单
router.delete("/menu/menuDel", function (req, res) {
  const query = req.query;
  try {
    menuDel(query, () => {
      res.send("删除成功");
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});

module.exports = router;
