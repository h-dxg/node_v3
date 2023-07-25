//数据库操作封装
const db = require("../../common");
const pagerFun = require("../../utils/pageutil");
const { insertNode } = require("./menu");

const getMenus = (req, callback) => {
  // 获取用户信息
  let user = req.data;
  db.query(
    `select * from role_menu where role_id in ( select role_id from role_users where user_name = '${user.username}');`,
    (data) => {
      console.log(data, "菜单权限11111111");
      // 当前用户下的角色菜单表数据
      if (data.length > 0) {
        // 合并菜单id
        let ids = "";
        data.forEach((e) => {
          if (e.menu_id && e.menu_id != "undefined") {
            ids += e.menu_id + ",";
          }
        });
        let a = ids.split(",");
        a.pop();
        let set = new Set(a);
        let str = [...set].join(",");
        db.query(
          `SELECT *, DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') AS create_time FROM menu where id in (${str});`,
          (res) => {
            let r = {
              usefInfo: user,
              menusList: []
            };
            // 查询树结构
            try {
              let d = insertNode(res, 0);
              console.log(d, 'dddd');
              r.menusList = d[0].children;
              console.log(r, "结构树");
              callback(r);
            } catch (error) {
              callback(r);
            }

          }
        );
      } else {
        callback('暂无数据权限');
      }
    }
  );
};

const userList = (count, page, callback) => {
  db.query(`select count(*)from user; `, (res) => {
    db.query(
      `select user_id,user_name,user_number,loginName from user order by user_id limit ${pagerFun(page, count).skipIndex
      }, ${pagerFun(page, count).pager.pageSize};`,
      (data) => {
        var r = {
          msg: "success",
          records: data,
          total: res[0]["count(*)"],
        };
        callback(r);
      }
    );
  });
};
const userInfo = (id, callback) => {
  db.query(
    `SELECT * FROM user WHERE user_id = '${id}';`,
    (data) => {
      db.query(
        `select * from role_users WHERE user_id = ${id};`,
        (res) => {
          let rids = []
          if (res.length > 0) {
            res.forEach(e => {
              rids.push(e.role_id)
            })
          }
          data[0].roleIds = rids.join(',')
          var r = {
            msg: "success",
            records: data[0],
          };
          callback(r);
        }
      );
    }
  );
}
const userAdd = async (data, callback) => {
  console.log(data, "data用户");
  db.insert("user", data, (res) => {
    if (res) {
      if (data.roleIds) {
        userRoleFn(data, res.insertId, callback);
      } else {
        callback(res);
      }
    }
  });
};
const userDel = (data, callback) => {
  if (data.user_id == "10013") {
    callback({ msg: "删除失败，管理员禁止删除", status: 500 });
  } else {
    db.del("user", data, (res) => {
      callback(res);
    });
  }
};
const userUpdate = (data, callback) => {
  const { user_id } = data;
  let wheres = {
    user_id,
  };
  db.update("user", data, wheres, (res) => {
    callback(res);
  });
};
// 用户角色管理表处理
const userRoleFn = (row, id, callback) => {
  db.query(`SELECT * FROM user WHERE user_id = '${id}'`, (data) => {
    let users = row.roleIds.split(",");
    let arr = data[0];
    let res = [];
    users.forEach((e) => {
      let str = `('${arr.user_name}','${arr.loginName}',${arr.user_id},${e})`;
      res.push(str);
    });
    let sql = `INSERT INTO role_users (user_name, loginName,user_id,role_id) VALUES${res.join(
      ","
    )};`;
    console.log(sql, "sql");
    db.query(sql, (data) => {
      callback(data);
    });
  });
};

module.exports = {
  getMenus,
  userInfo,
  userList,
  userAdd,
  userDel,
  userUpdate,
};
