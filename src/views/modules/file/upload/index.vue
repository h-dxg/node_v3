<template>
  <div class="main">
    <div class="fm-upload-file">
      <div class="file-button" style="padding: 5px">
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="primary" @click="handleAdd">选择文件</el-button>
        <el-button type="warring" @click="uploadStop()">暂停上传</el-button>
        <input
          multiple
          ref="uploadInput"
          @change="handleChange"
          type="file"
          name="file"
          class="upload_input"
        />
      </div>
      <el-table :key="key" :data="table" style="width: 100%">
        <el-table-column label="文件名">
          <template v-slot="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="大小">
          <template v-slot="scope">
            <span>{{ (scope.row.size / 1024).toFixed(2) + "kb" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <span v-if="scope.row.state === -1">正在计算MD5</span>
            <span
              style="color: green"
              v-if="scope.row.state === 1 && scope.row.percent === 0"
              >MD5计算完成，准备上传</span
            >
            <span v-if="scope.row.state === 4" style="color: brown">上传失败</span>
            <span v-if="scope.row.state === 5" style="color: chartreuse">已上传</span>
            <el-progress
              style="width: 100%"
              v-if="scope.row.state === 2"
              :text-inside="true"
              :stroke-width="20"
              :percentage="scope.row.percent"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              :disabled="scope.row.state !== 1&&scope.row.stopStatus!==true"
              type="danger"
              @click="uploadStart(scope.$index, scope.row)"
              >开始上传</el-button
            >
            <el-button v-if="scope.row.path" type="danger" @click="deleteRow(scope.row,()=>{ search() })">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :total="totalNum"
          :background="true"
          :page-size="pageCount"
          :current-page="currentPage"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive , onMounted } from "vue";
import { AddFile_Api, EndFile_Api, FindFile_Api } from "@/api/file/upload";
import axios from "axios";
import { useList } from "./bigFile-hook";

var CancelToken = axios.CancelToken;
let uploadInput = ref();
let table = reactive([]);
let ReqList = reactive([]); //默认请求函数列表
let bytesPerPiece = 0.1 * 1024 * 1024; // 每个文件切片大小定为10MB .
const {
  totalNum,
  pageCount,
  currentPage,
  getList,
  handleCurrentChange,
  deleteRow
} = useList();
onMounted(async () => {
  await search();
});
const search = async () => {
  table.length=0
  let res = await getList()
  table.push(...res)
}
const handleAdd = () => {
  //触发文件上传点击事件
  uploadInput.value.click();
};
const handleChange = async () => {
  let result = [];
  let file = uploadInput.value.files[0];
  table.push({
    name: file.name,
    size: file.size,
    state: -1,
    percent: 0,
    stopStatus:false,
  });
  // 传入需要切割的大小,调用封装切片函数，得到每个文件的切片Blob对象集合
  result = await createChunk(file, bytesPerPiece);
  console.log(result,'result');
  //计算文件的的hash 计算时间可能过长 可以放到webworker中进行计算
  onworker(result).then((res) => {
    // res:计算得出的MD5
    table[table.length - 1].res = result;
    table[table.length - 1].md5 = res;
    table[table.length - 1].state = 1;
  });

};
const uploadStart = async (index, file) => {
  table[index].percent = (100 / file.res.length).toFixed(0);
  // hash文件预检
  try {
    let { data } = await FindFile_Api({ hash: file.md5 });
    if (data) {
      // 开始上传文件
      FilesOtions(data, file, index);
    }
  } catch (e) {
    console.log(e, "eee");
  }
};
function FilesOtions(data, file, index) {
  let state = data.state;
  switch (state) {
    case 0:
      //已有文件，直接秒传
      file.state = 5;
      break;
    case 1:
      //暂无切片文件，上传切片
      startUpload(index, file);
      break;
    case 2:
      //有部分切片，需要续传
      // let files = data.files
      startUpload(index, file, data.files);
      break;
  }
}
/**
 * 文件上传函数
 * @param {Number} index - 当前文件列表的下标.
 * @param {Object} file - 当前文件对象.
 * @param {Array} continueList - 已经存在的切片数组.
 *
 */
const startUpload = async (index, file, continueList = []) => {
  file.state = 2;
  let data = file.res.map((e, index) => {
    return {
      filename: file.name,
      size: file.size,
      md5: file.md5,
      chunk: e,
      index,
    };
  });
  // 开始上传
  let res_ = await uploadChunks(data, index, continueList);
  if (res_) {
    Promise.all(res_)
      .then(async (res) => {
        //当所有切片都成功上传后，发送合并请求 EndFile_Api
        if (res) {
          try {
            let res = await EndFile_Api(file, {
              repeat_request_cancel: false,
              loading: false,
            });
            if (res) {
              file.state = 5;
              search()
              console.log(res);
            }
          } catch (e) {
            file.state = 4;
            console.log(e);
          }
        }
      })
      .catch((e) => {
        file.state = 4;
        console.log(e);
      });
  }
};
const uploadChunks = async (uploadedList = [], index_, continueList) => {
  let data = uploadedList.map(({ filename, size, md5, chunk, index }) => {
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("size", size);
    formData.append("md5", md5);
    formData.append("chunk", chunk);
    formData.append("chunkName", md5 + "_" + index);
    return { formData };
  });
  let file_filter = data;
  if (continueList.length > 0) {
    //进行断点续传过滤
    file_filter = data.filter((e) => {
      return (
        continueList.find((j) => j === e.formData.get("chunkName")) !==
        e.formData.get("chunkName")
      );
    });
  }
  let count = 0;
  return  file_filter.map(async ({ formData }, index) => {
    let res = await getRequest(formData);
    if (res) {
      count++;
      table[index_].percent = ((count / file_filter.length) * 100).toFixed(0);
    }
  });
 
};
const getRequest = async (formData) => {
  return new Promise((resolve, reject) => {
    try {
      let cancel; //生成取消实例
      AddFile_Api(
        formData,
        {
          repeat_request_cancel: false,
          loading: false,
        },
        {
          cancelToken: new CancelToken(function executor(c) {
            // 参数 c 也是个函数
            cancel = c;
          }),
        }
      )
        .then(({ data }) => {
          resolve(data);
          ReqList = deleCancel(data);
        })
        .catch((e) => {
          console.log(e, "eee");
        });
      ReqList.push({ cancel, key: formData.get("chunkName") });
    } catch (e) {
      reject(e);
    }
  });
};
function deleCancel(item) {
  return ReqList.filter((e) => e.key !== item);
}
// 暂停上传
const uploadStop = () => {
  table.forEach(e => {
    e.stopStatus=true
  })
  ReqList.forEach((e) => {
    e.cancel("取消");
  });
};
/**
 * 切片函数
 * @param {Object} file - 文件对象.
 * @param {Number} chunkSize - 每个切片大小.
 */
const createChunk = async (file, chunkSize) => {
  const result = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    let blob = file.slice(i, i + chunkSize); //对文件i到i+chunkSize字符进行分割
    result.push(blob);
  }
  return result;
};

// 启动webworker
const onworker = (chunks) => {
  if (typeof Worker === "undefined") return false;
  return new Promise((resolve) => {
    // 创建webworekr
    function createWorker(f) {
      const blob = new Blob(["(" + f.toString() + ")()"], {
        type: "application/javascript",
      });
      const blobUrl = window.URL.createObjectURL(blob);
      const worker = new Worker(blobUrl);
      return worker;
    }
    const pollingWorker = createWorker(function () {
      // 子进程函数
      // 导入第三方计算MD5库
      self.importScripts("http://localhost:8080/js-spark-md5.js");
      self.onmessage = function onmessage(ev) {
        const spark = new self.SparkMD5(); //创建mds算法实例
        let chunks = ev.data.chunks;
        /**
         * hash添加函数
         * @param {Array} chunks - blob文件对象集合.
         */
        const hash = (chunks) => {
          return new Promise((resolve) => {
            function read(i) {
              if (i >= chunks.length) {
                resolve(spark.end()); //计算结束 得出hsah
                //大于切片对象数组长度时终止循环
                return;
              }
              const blob = chunks[i];
              const reader = new FileReader(); //创建读取文件实例
              reader.readAsArrayBuffer(blob); //读取字节
              // 异步读取
              reader.onload = (e) => {
                const bts = e.target.result; //读取到的字节数组
                spark.append(bts); //把一组字节压入计算hash
                read(i + 1);
              };
            }
            read(0);
          });
        };
        hash(chunks).then((res) => {
          // 得到结果提交给主线程
          self.postMessage(res);
        });
      };
    });
    // 主进程函数
    pollingWorker.postMessage({
      chunks, // 切片集合数组
    });
    pollingWorker.onmessage = function onmessage(ev) {
      console.log(ev.data, "处理结束了");
      resolve(ev.data);
      //关闭线程
      pollingWorker.terminate();
    };
  });
};
</script>
<style lang="scss">
.fm-upload-file {
  .upload_input {
    display: none !important;
  }
}
</style>
