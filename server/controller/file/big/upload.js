const path = require("path");
const fs = require("fs");
const db = require("../../../common");
const pagerFun = require("../../../utils/pageutil");
const target_ = path.resolve('C:/', "upload"); //保存一个文件夹路径用于存放文件
const target = path.resolve('C:/', "upload/files"); //保存一个文件夹路径用于存放文件
const address = path.resolve('C:/', "upload/temp"); //保存一个文件夹路径用于存放temp切片文件

// 文件列表查询
const list = (count, page, callback) => {
  db.query(`select count(*)from file_big; `, (res) => {
    console.log(res, 'sss');
    db.query(
      `select * from file_big order by id limit ${pagerFun(page, count).skipIndex
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
// 文件删除
const Del = (data, callback) => {
  let { id, path } = data
  console.log(path, 'data11');
  db.del("file_big", { id }, (res) => {
    //数据库删除，并且删除具体文件
    fs.unlink(target + "/" + path, (err) => {
      if (err) {
        console.log('删除失败~');
        return;
      }
    });
    callback('删除成功');
  });
};
// 上传文件切片
const add = (multipart, req, callback) => {
  multipart.uploadDir = address; //保存文件的地址
  multipart.parse(req, async (err, fields, files) => {
    // console.log(fields, "fields"); //fields打印的是form表单里面的提交的表单数据
    // console.log(files, "files"); //files打印的是上传文件的信息
    if (err) {
      return;
    }
    const [chunkName] = fields.chunkName; //分片名称
    const [chunk] = files.chunk; //文件信息

    // 创建流读
    let readStream = fs.createReadStream(chunk.path);
    // 创建流写
    let ws = fs.createWriteStream(address + "/" + chunkName);
    readStream.on("data", (chunk) => {
      // console.log(chunk.length, '长度');
      // 流写入内容
      ws.write(chunk);
      // console.log(chunk, '长度');
    });
    readStream.on("end", () => {
      // 删除原临时文件
      fs.unlink(chunk.path, (err) => {
        if (err) {
          // console.log('删除失败~');
          return;
        }
        ws.close();
      });
    });
    callback(chunkName);
  });
};
// 合并文件
const end = async (file, callback) => {
  console.log(file, "filefile文件");
  const fileName = file.name; //文件名称
  const md5 = file.md5; //文件hash
  // 读取缓存temp文件夹下的文件，找到相同md5值的文件进行合并
  let fileAsync = new Promise((resolve, reject) => {
    fs.readdir(address, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.filter((e) => e.includes(md5)))
    });
  });
  fileAsync.then(async (files) => {
    // 根据下标进行排序，防止前端上传过程中有中断的切片没有上传
    files.sort((a, b) => a.split("_")[1] - b.split("_")[1]);
    // 创建最终的写入流
    let ws = fs.createWriteStream(target + "/" + md5 + "_" + fileName);
    try {
      //进行递归调用合并文件
      thunkStreamMergeProgress(files, ws);
      let data = {
        name: fileName,
        size: file.size,
        state: 5,
        path: md5 + "_" + fileName
      }
      console.log(data, '保存数据库');
      db.insert("file_big", data, (res) => {
        if (res) {
          callback("合并成功");
        }
      });

    } catch (error) {
      console.log(error);
      callback({ error: { msg: "合并失败", status: 500 } });
    }
  });
};
// 续传秒传预检测
const find = async (data, callback) => {
  // 先检测文件存储文件没有就创建
  isFile().then(async () => {
    let { hash } = data;
    let result = {
      files: [],
      state: 0,
      message: "上传成功",
    };
    let res = await findFileHash(hash);
    if (res && res.length > 0) {
      // 先找文件存放的地方，如果有完整的文件直接提示上传成功
      callback(result);
    } else {
      //完整文件没有，再去temp临时文件中查找是否有切片
      try {
        let res_ = await findTempHash(hash);
        if (res_.length === 0) {
          result.message = "暂无切片文件，请上传切片";
          result.state = 1;
          callback(result);
        } else {
          result.message = "请核对上传分片";
          result.state = 2;
          result.files = res_;
          callback(result);
        }
      } catch (error) {
        result.message = "暂无切片文件，请上传切片";
        result.state = 1;
        callback(result);
      }
    }
  })

};

function isFile() {
  return new Promise((resolve, reject) => {
    fs.readdir(target_, (err, data) => {
      if (err) {
        console.log('读取失败');
        let arr = [target_, target, address]
        let count = 0
        arr.forEach(e => {
          fs.mkdir(e, err => {
            if (err) {
              console.log('创建失败~');
              reject();
            }
            count++
          });
        })
        if (count === 3) {
          count = 0
          resolve()
        }
      }
      resolve()
    });
  })

}
function findFileHash(hash) {
  return new Promise((resolve, reject) => {
    fs.readdir(target, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.filter((e) => e.includes(hash)));
    });
  });
}
function findTempHash(hash) {
  return new Promise((resolve, reject) => {
    fs.readdir(address, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.filter((e) => e.includes(hash)));
    });
  });
}
/**
 * 合并每一个切片
 * @param {*} files 文件数据
 * @param {*} fileWriteStream 最终的写入结果
 */
function thunkStreamMergeProgress(files, fileWriteStream) {
  if (!files.length) {
    return fileWriteStream.end();
  }
  const currentFile = path.resolve(address, files.shift());
  const currentReadSteam = fs.createReadStream(currentFile);
  //写入文件内容，括号内的会覆盖readStream的内容
  currentReadSteam.pipe(fileWriteStream, { end: false });
  //合并后，删除切片
  fs.rm(currentFile, { recursive: true }, (err) => {
    if (err) {
      console.error(err.message);
      return;
    }
  });
  currentReadSteam.on("end", () => {
    thunkStreamMergeProgress(files, fileWriteStream);
  });
}

module.exports = {
  list,
  add,
  end,
  find,
  Del
};
