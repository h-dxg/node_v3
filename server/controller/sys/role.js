//数据库操作封装
const db = require("../../common");
const pagerFun = require("../../utils/pageutil");

// 查询角色
const roleList = (count, page, callback) => {
  if (typeof count !== 'string') {
    // 查询单个
    db.query(
      `SELECT * FROM role_table WHERE id=${count.id};`,
      (data) => {
        let res = {}
        res = data.length > 0 ? data[0] : {}
        callback(res)
      }
    );
  } else {
    db.query(`select count(*)from user; `, (res) => {
      db.query(
        `select id,role_type,name,remarks ,userId,menuIds from role_table order by id limit ${pagerFun(page, count).skipIndex
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
  }

};
// 新增角色
const roleAdd = (data, callback) => {
  db.insert("role_table", data, (res) => {
    callback(res);
  });
};
// 删除角色
const roleDel = (data, callback) => {
  console.log(data, '删除11');
  if (data.id == "1") {
    callback({ msg: "删除失败，请联系管理员删除", status: 500 });
  } else {
    // 删除当前id下所有的role_user表数据
    db.del("role_users", { role_id: data.id }, (r) => {
      if (r) {
        db.del("role_table", data, (res) => {
          console.log('22222222');
          callback(res);
        });
      } else {
        callback({ msg: "删除失败，请联系管理员删除", status: 500 });
      }
    });
  }
};
// 修改角色
const roleUpdate = (data, callback) => {
  const { id } = data;
  let wheres = {
    id,
  };
  db.update("role_table", data, wheres, (res) => {
    console.log(res, "resresres");
    // 查询菜单角色关联表是否存在当前角色的id
    db.query(
      `SELECT * FROM role_menu WHERE role_id = ${id};`,
      (res) => {
        console.log(res, 'resresres111');
        console.log(data, 'data111');
        if (data.menuIds) {
          if (res.length > 0) {
            // 修改操作
            let datas = {
              menu_id: data.menuIds
            }
            let w = {
              role_id: id
            }
            db.update("role_menu", datas, w, () => {
              callback('权限修改成功');
            });
          } else {
            // 新增操作
            let datas = {
              role_id: data.id,
              menu_id: data.menuIds
            }
            db.insert("role_menu", datas, () => {
              callback('权限修改成功');
            });
          }
        } else {
          callback({ error: '权限修改失败' });
        }
      }
    );
  });
};
// 角色人员新增
const roleUserAdd = (data, callback) => {
  let { userid, rid } = data
  db.query(`select * from role_users WHERE role_id = ${rid};`,
    (data) => {
      if (data.length > 0) {
        let uids = userid.split(',')
        data.forEach(e => {
          if (uids.includes(e.user_id)) {
            uids.splice(uids.indexOf(e.user_id), 1)
          }

        });
        console.log(uids, '不重复的数据');
        if (uids.length !== 0) {
          let ids = uids.join(',')
          addRoleUsers(ids, rid, callback)
        } else {
          callback('成功')
        }
      } else {
        addRoleUsers(userid, rid, callback)
      }
    }
  );

};
function addRoleUsers(ids, rid, callback) {
  db.query(
    `SELECT * FROM user WHERE user_id IN(${ids});`,
    (data) => {
      if (data.length > 0) {
        let res = []
        data.forEach(e => {
          res.push(`('${rid}', '${e.user_name}', '${e.loginName}', '${e.user_id}')`)
        });
        let val = res.join(',')
        db.query(
          `INSERT INTO role_users (role_id, user_name, loginName, user_id) VALUES ${val}`,
          (data) => {
            callback('添加成功');
          }
        );
      }
    }
  );
}
// 查询角色人员
const roleUserList = (data, callback) => {
  db.query(`select * from role_users WHERE role_id = ${data.id};`,
    (data) => {
      var r = {
        msg: "success",
        records: data,
      };
      callback(r);
    }
  );
};
//删除角色人员
const roleUserDel = (data, callback) => {
  db.del("role_users", data, (res) => {
    callback(res);
  });
};

module.exports = {
  roleList,
  roleAdd,
  roleUpdate,
  roleDel,
  roleUserAdd,
  roleUserList,
  roleUserDel
};
