const express = require("express");
const router = express.Router();
const { add, end, find, list, Del } = require("../controller/file/big/upload");
const multiparty = require("multiparty");

//文件列表查询
router.get("/upload/list", function (req, res) {
  try {
    const { count, page } = req.query;
    list(count, page, (r) => {
      if (r.error) {
        res.status(r.error.status).json({ success: false, error: r.error.msg });
      }
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "请求失败" });
  }
});
// 文件上传接口
router.post("/upload", function (req, res) {

  // 注意实例需要创建在接口中
  const multipart = new multiparty.Form();
  try {
    add(multipart, req, (r) => {
      if (r.error) {
        res.status(r.error.status).json({ success: false, error: r.error.msg });
      }
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "请求失败" });
  }

});
//文件上传结束接口
router.post("/upload/end", function (req, res) {
  try {
    end(req.body, (r) => {
      if (r.error) {
        res.status(r.error.status).json({ success: false, error: r.error.msg });
      }
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "上传失败" });
  }
});
//文件上传预检测
router.get("/upload/find", function (req, res) {
  try {
    find(req.query, (r) => {
      if (r.error) {
        res.status(r.error.status).json({ success: false, error: r.error.msg });
      }
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "请求失败" });
  }
});
// 删除wenj
router.delete("/upload/del", function (req, res) {
  const query = req.query;
  try {
    Del(query, (r) => {
      res.send(r);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "操作失败" });
  }
});

module.exports = router;
