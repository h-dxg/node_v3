const mysql = require("mysql");
// 连接池 它一次性的创建了多个连接，然后根据客户端的查询，自动的 分发、复用、管理 这些连接。
const pool = mysql.createPool({
  host: "107.151.249.219", //本地数据库
  user: "username", //用户名
  password: "123456", //本地数据库密码
  database: "dxg", // 目标数据库名
  // 可选
  queueLimit: 1500,
  connectionLimit: 20, //连接数
});
// 开启事务循环
const connectHandle = () =>
  new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error(
          "链接错误：" + err.stack + "\n" + "链接ID：" + connection.threadId
        );
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
const transaction = async (table, datas = [], callBack) => {
  const connection = await connectHandle(); // 得到链接
  //开启事务
  await connection.beginTransaction((err) => {
    if (err) {
      return "开启事务失败";
    } else {
      let fields = ""; //字段
      let t = "";
      for (const k in datas[0]) {
        fields += k + ","; //拼接字段
        t += `?,`;
      }
      //清除最后一位的逗号。
      fields = fields.slice(0, -1);
      t = t.slice(0, -1);
      const sql = `INSERT INTO ${table} (${fields}) VALUES (${t})`;
      for (let i = 0; i < datas.length; i++) {
        const values = [];
        for (const k in datas[i]) {
          values.push(datas[i][k]);
        }
        //执行INSERT插入操作
        connection.query(sql, values, (e, rows) => {
          if (e) {
            return connection.rollback(() => {
              callBack(e.sqlMessage);
            });
          } else {
            connection.commit((error) => {
              if (error) {
                console.log("事务提交失败");
              }
              console.log("事务提交成功");
              callBack("事务提交成功");
            });
          }
        });
      }
      // callBack()
      connection.release(); // 释放链接
    }
  });
};
//添加一个query方法
let query = function (sql, callBack) {
  pool.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      callBack(err);
      return;
    }
    conn.query(sql, (err, data) => {
      conn.release();
      if (err) {
        console.log(err);
        return;
      }
      if (callBack) {
        callBack(data);
      }
      return;
    });
  });
};
/**
 * 插入数据
 * @param {*} table 表名
 * @param {*} datas 数据对象
 * @param {*} callBack 插入成功后的回调函数
 */
let insert = (table, datas, callBack) => {
  //拼接SQL
  let fields = ""; //字段
  let values = ""; //值
  for (const k in datas) {
    fields += k + ","; //拼接字段
    values += `'${datas[k]}',`;
  }
  //清除最后一位的逗号。
  fields = fields.slice(0, -1);
  values = values.slice(0, -1);
  // console.log(fields);
  // console.log(values);
  let sql = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
  query(sql, callBack);
};

//封装一个删除sql方法
let del = (table, datas, callBack) => {
  let arr = ["1=1"]; //避免datas为空时，出现异常错误。
  for (const k in datas) {
    arr.push(`${k} = '${datas[k]}'`);
  }
  let sql = `delete from ${table} where ${arr.join(" and ")}`;
  query(sql, callBack);
};
/**
 * 修改方法
 * @param {string} table 表名
 * @param {object} sets 修改的字段与值
 * @param {object} wheres 判断条件
 * @param {Function} callBack 回调函数
 */
let update = (table, sets, wheres, callBack) => {
  //准备一个数组，用来拼接 where子句
  let whereArr = ["1=1"]; //避免datas为空时，出现异常错误。
  for (const k in wheres) {
    whereArr.push(`${k} = '${wheres[k]}'`);
  }
  //准备一个数组，用来拼接 set 子句
  let setArr = [];
  for (const k in sets) {
    setArr.push(`${k} = '${sets[k]}'`);
  }
  let sql = `UPDATE ${table} SET ${setArr.join(",")}  WHERE ${whereArr.join(
    " and "
  )}`;
  query(sql, callBack);
};
// 导出
module.exports = {
  query,
  insert,
  del,
  update,
  transaction,
};
