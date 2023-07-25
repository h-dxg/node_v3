//数据库操作封装
const db = require("../../common");

const menuList = (params, callback) => {
  console.log(params, "params");
  db.query(
    `SELECT *, DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') AS create_time FROM menu;`,
    (data) => {
      let r = {};
      if (params.istree) {
        // 查询树结构
        r.records = insertNode(data, 0);
      } else {
        r.records = data;
      }
      callback(r);
    }
  );
};
// 新增菜单
const menuAdd = (data, callback) => {
  console.log(data, "data11");
  // const { pid } = data;
  db.insert("menu", data, (res) => {
    callback("添加成功");
  });
};
// 修改菜单
const menuUpdate = (data, callback) => {
  const { id, name, icon, type, url, pid, sort } = data;
  let wheres = {
    id,
  };
  let datas = {
    name,
    icon,
    type,
    url,
    pid,
    sort,
  };
  db.update("menu", datas, wheres, (res) => {
    callback("修改成功");
  });
};
// 删除菜单
const menuDel = async (data, callback) => {
  if (data.id == "101") {
    callback({ msg: "删除失败，请联系管理员删除", status: 500 });
    throw "删除失败，基础菜单禁止删除";
  } else {
    // 1.定义删除节点和其子节点
    let res = await deleteNode(data, callback, []);
    if (res) {
      // console.log('删除成功再删除id');
      db.del("menu", { id: data.id }, async () => {
        callback('删除成功');
      });
    } else {
      // console.log('直接删除id');
      db.del("menu", { id: data.id }, async () => {
        callback('删除成功');
      });
    }
  }
};
// 遍历平级转数结构数据
const insertNode = (arr, pid) => {
  let result = [];
  dCode(arr, pid, result);
  return result;
};
const dCode = (arr, pid, result) => {
  arr.forEach((e) => {
    if (e.pid === pid) {
      let parent = { ...e, value: e.id, label: e.name, children: [] };
      result.push(parent);
      dCode(arr, e.id, parent.children);
    }
  });
};
// 获取删除节点及其子节点函数
async function deleteNode (data, callback) {
  // 1. 找到要删除节点的子节点
  const subNodes = await findSubNodes(data.id, callback);
  // 2. 删除子节点
  if (subNodes.length > 0) {
    for (const subNode of subNodes) {
      await deleteNode(subNode, callback);
    }
  }
  // 3. 删除要删除节点本身
  return await deleteMenu(subNodes);
}

const findSubNodes = async (id) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id FROM menu WHERE pid = ${id};`, (data) => {
      // console.log(data, "查到的数据");
      resolve(data)
    });
  });
};
const deleteMenu = async (subNodes) => {
  let res = null
  if (subNodes.length > 0) {
    for (const i of subNodes) {
      res = await del(i)
    }
  }
  return res
}
const del = async (i) => {
  // return await setTimeout(() => {
  //   console.log('删除成功', i.id);
  // }, 500);
  return await db.del("menu", { id: i.id }, () => {
    console.log('删除成功');
  });
}

module.exports = {
  menuList,
  menuAdd,
  menuUpdate,
  menuDel,
  insertNode
};
