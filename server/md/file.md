# 前言

大文件上传这个技术虽然在前端算是比较常见的技术点，经常在面试或者项目亮点中可以看到，但是真正实现和完整的方案却很少在网上可以查阅。包括我自己，之前虽然理解大文件上传的基本思路，但是等真正实施功能的时候，其中还是有许多细节知识点值得一讲的。下面就带大家从零开始一套以 node 搭建服务，vue3 实现一套完整的大文件断点续传功能。

# 前端

所谓大文件上传，实际上就是许多个小文件的单个上传，当一个巨大的文件上传的时候，需要进行切割分成若干个小份，然后依次上传服务器。其中前端部分最核心的两个技术点就是切片和续传。这里可以封装 2 个单独的函数去完成。

## 切片

1. 首先点击文件获取文件信息，得到一个 File 对象
2. File 对象中有个方法叫 slice 也就是 File.prototype.slice，可以对文件进行切割分片。
3. 切割 File 文件对象后，会得到一个 Blob 类型的对象，可以直接在 ajax 中发送数据。
4. 可以看到分片的速度很快，是因为是不管 File 对象还是 Blob 对象，其实只保存了文件的基本信息，并没有保存实际文件数据。
5. 那么如果真正读取文件数据呢，需要使用 FileReader 去读取。
6. 封装 createChunk 函数最终通过切片得到一个切片集合的数组

```js
/**
 * 切片函数
 * @param {Object} file - 文件对象.
 * @param {Number} chunkSize - 每个切片大小.
 */
const createChunk = (file, chunkSize) => {
  const result = [];
  for (let i = 0; i < file.size; i += chunkSize) {
    let blob = file.slice(i, i + chunkSize); //对文件i到i+chunkSize字符进行分割
    result.push(blob);
  }
  return result;
};
```

## 断点续传

上面通过封装 createChunk 函数完成了对一个大文件的切片，得到一个 Blob 对象类型的数组
图片 111111111111111111111111111

切片算是完成了，那么当上传许多个小分片过程中，出现暂停、断网等特殊情况中断了上传，此时又需要后续上传的过程中，已经上传过的文件无需再传，要达到续传的目的。此时客户端就必须告诉服务器一个关键的信息，也就是每个文件的唯一标识指纹（hash），一个 hash 就代表一个独一无二的文件。

1. hash：是一种算法，可以把任何数据换算成一个固定长度的字符串（不可逆）,也就是根据文件内容而生成的唯一指纹，文件变化，hash 也随之变化。
2. md5:常见的 hash 算法，可以引入 js-spark-md5 库进行 hash 算法生成指纹，可以直接使用 npm 下载，也能单独下载到本地文件使用（本项目是把 js-spark-md5 文件包放在 public 中直接引用了）
3. 封装一个函数用来获取文件的 hash。不能直接全量文件计算 hash，由于文件过大，也会导致性能很差。推荐使用增量算法.也就是计算完一段 hash 就舍弃然后进行下一段的计算，这样内存就不会溢出。
4. 通过封装一个递归函数，由诺干个切片循环递归，最终计算出这个文件的 hash 值。主意需要把所有切片都进行计算之后才能得到文件的 hash
5. 由于计算 hash 可能会根据文件大小，计算时间也会有所不同，这里就把计算过程放入 webworker 中进行

```js
/**
 * hash添加函数
 * @param {Array} chunks - blob文件对象集合.
 */
// 这里就是传入的chunks就是之前切片生成的Blob 对象数组
const hash = (chunks) => {
  return new Promise((resolve) => {
    const spark = new SparkMD5(); //创建mds算法实例
    function read(i) {
      if (i >= chunks.length) {
        console.log(spark.end());
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
```

考虑到性能问题，我们把这段代码放入 Webworker 中进行一个优化。关于 Webworker 这里不过多介绍用法，可查阅其他资料。

```js
// 启动webworker  返回一个promise
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
```

以上两个便是前端大文件上传最核心的技术点，下面介绍服务端该如何实现。

# 服务端

这里本地搭建了一套 node 服务。服务端这里一共写了三个接口，也就是大文件上传的核心逻辑。

```js
// 引入三个接口
import { AddFile_Api, EndFile_Api, FindFile_Api } from "@/api/file/upload";
```

## AddFile_Api

- 切片上传接口：这里用到一个中间件 multiparty，在 node 中处理大文件的一个插件，具体使用方法可查阅文档。

```js
const multiparty = require("multiparty");
// ......
// ......
router.post("/upload", function (req, res) {
  // 注意实例需要创建在接口中,然后把实例传入逻辑层进行使用
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
```

add 方法主要处理的逻辑就是接收上传的切片，首先要定义切片的缓存 temp 文件路径，然后再根据 multipart.parse 方法的回调获取当前切片的文件信息，这里上传的每个切片信息需要在前端定义好。

```js
const formData = new FormData();
formData.append("filename", filename); //文件名称
formData.append("size", size); //文件总大小
formData.append("md5", md5); //文件通过hash算法计算出来的唯一hash值
formData.append("chunk", chunk); //每个切片的二进制数据
formData.append("chunkName", md5 + "_" + index); //每个切片的临时文件名称，又hash和下标组成，这个临时名称很关键后续有用
```

下面的逻辑主要做了一个读取每个通过 multipart 生成的无规则名称的临时文件，然后再根据每个切片的临时文件名称重新写入在 temp 临时文件下，最后删除之前的无规则文件。

```js
const address = path.resolve(__dirname, "../..", "upload/temp"); //保存一个文件夹路径用于存放temp切片文件
const target = path.resolve(__dirname, "../..", "upload/files"); //保存一个文件夹路径用于存放文件
multipart.uploadDir = address; //保存文件的地址
multipart.parse(req, async (err, fields, files) => {
  // 通过前端上传的文件信息，这里可以在fields, files两个回调参数中获取
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
```

## EndFile_Api

接收请求，也叫合并文件请求。就是在上传完所有切片，且没有报错或者未上传完整的切片的情况下，才会执行这个接口。触发时机由前端判断。这段代码逻辑比较简单，主要是通过前端上传的文件对象信息来处理即可。

1. 首先获取文件信息，然后再读取 temp 缓存路径下的具有相同 MD5 值的文件进行收集
2. 收集完成之后根据 temp 文件，也就是之前上传好的临时切片文件，根据下标进行排序，以便于文件流的合并
3. 通过 thunkStreamMergeProgress 方法递归，实现对每个临时文件的读取，然后重新写入正式存放文件的目录 file 文件夹下，然后删除所有已经合并的临时文件

```js
const end = async (file, callback) => {
  const filename = file.name; //文件名称
  const md5 = file.md5; //文件hash
  // 读取缓存temp文件夹下的文件，找到相同md5值的文件进行合并
  let fileAsync = new Promise((resolve, reject) => {
    fs.readdir(address, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data.filter((e) => e.includes(md5)));
    });
  });
  fileAsync.then(async (files) => {
    // 根据下标进行排序，防止前端上传过程中有中断的切片没有上传
    files.sort((a, b) => a.split("_")[1] - b.split("_")[1]);
    // 创建最终的写入流
    let ws = fs.createWriteStream(target + "/" + md5 + "_" + filename);
    try {
      //进行递归调用合并文件
      thunkStreamMergeProgress(files, ws);
      callback("合并成功");
    } catch (error) {
      console.log(error);
      callback({ error: { msg: "合并失败", status: 500 } });
    }
  });
};
function thunkStreamMergeProgress(files, fileWriteStream) {
  if (!files.length) {
    return fileWriteStream.end();
  }
  const currentFile = path.resolve(__dirname, address, files.shift());
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
```

## FindFile_Api

预检测接口，也是大文件续传和秒传的关键方法。主要是用于判断文件是否已经存在服务器，或者是否已有部分切片上传。触发时机在每次上传文件之前调用，根据后端判断返回后，前端再决定是否上传新文件，还是续传文件。思路很简单，就是根据前端上传前传入的 hash 值，先去正式存在文件的 file 文件夹下查找。

1. 如果 file 文件夹下存在，之前提示前端实现文件秒传
2. 如果 file 文件夹不存在再去 temp 文件下找，查看是否有相同 hash 的 temp 文件，如果有就把存在的 temp 文件返回给前端进行一个过滤，实现已上传的文件无须再传
3. 如果再 2 个文件都找不到，说明是一个全新的文件，前端直接上传所有切片。

```JS
const find = async (data, callback) => {
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
};
```

# 具体代码

图片 22222222222222222
前端这里采用 elementUI +vue3 的技术栈，以表格形式，可以上传多个文件，包括进度条显示，开始上传，暂停上传等功能。

## 初始化工作

首先需要定义一些全局变量方便上传使用

```js
let uploadInput = ref(); //原生input实例ref
let tableData = reactive([]); //表格数据源列表数据，存放的是包装后的每个文件对象
let ReqList = reactive([]); //默认请求取消的函数列表，用于暂停取消请求的功能
let bytesPerPiece = 1 * 1024 * 1024; // 每个文件切片默认的大小 .
```

下面贴上 template 代码:

```html
<div class="main">
  <div class="fm-upload-file">
    <div class="file-button" style="padding: 5px">
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
    <el-table :key="key" :data="tableData" style="width: 100%">
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
          <span v-if="scope.row.state === 4" style="color: brown"
            >上传失败</span
          >
          <span v-if="scope.row.state === 5" style="color: chartreuse"
            >已上传</span
          >
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
          <el-button type="danger" @click="deleteFile(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</div>
```

## 选择文件

点击按钮，触发原生 input 文件上传的 click 事件

```js
const handleAdd = () => {
  //触发文件上传点击事件
  uploadInput.value.click();
};
```

选取文件后原生 input 的 change 事件就会触发，并且获取文件对象.这里我们需要对文件对象进行一个包装，加入一些我们需要的参数，如进度条，状态等等，然后就是调用开始就封装好的 2 个核心函数，获取切片数组和 hash 值。

```js
const handleChange = async () => {
  let result = [];
  let file = uploadInput.value.files[0];
  tableData.push({
    name: file.name,
    size: file.size,
    state: -1,
    percent: 0,
    stopStatus: false,
  });
  // 传入需要切割的大小,调用封装切片函数，得到每个文件的切片Blob对象集合
  result = await createChunk(file, bytesPerPiece);
  console.log(result, "result");
  onworker(result).then((res) => {
    // res:计算得出的MD5
    tableData[tableData.length - 1].res = result;
    tableData[tableData.length - 1].md5 = res;
    tableData[tableData.length - 1].state = 1;
  });
};
```

## 开始上传文件

选取文件后会在表格中显示，再计算好 hash 值后即可点击上传按钮,这里就会调用最开始的预检接口，用去判断文件是否存在，通过 FilesOtions 函数判断该以哪种方式上传文件。

1. 直接上传所有切片
2. 无需上传，模拟秒传成功
3. 根据已存在的过滤切片上传

```js
const uploadStart = async (index, file) => {
  tableData[index].percent = (100 / file.res.length).toFixed(0);
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
```

关于上传函数的封装，不管是哪种请求上传切片，都会走这个上传函数 startUpload。这里并没有做并发的限制，感兴趣的兄弟们可以自行优化。出于功能的实现，我这里就采取了 promise.all 来处理多个切片的并发请求。

```js
const startUpload = async (index, file, continueList = []) => {
  // ......
  // ......
  // 开始上传
  let res_ = await uploadChunks(data, index, continueList);
  if (res_) {
    Promise.all(res_)
      .then(async (res) => {
        // ........
      })
      .catch((e) => {
        // ........
      });
  }
};
/**
 * 上传函数
 * @param {Array} uploadedList - 根据每个切片包装的一个对象集合.
 * @param {Array} index_ - 当前文件列表的数据下标.
 * @param {Array} continueList - 已经存在的切片数组.
 *
 */
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
  //  ......
  //  ......
  //  ......
  let count = 0;
  return data.map(async ({ formData }, index) => {
    return new Promise(async (resolve, reject) => {
      try {
        count++;
        let res = await AddFile_Api(formData);
        tableData[index_].percent = ((count / data.length) * 100).toFixed(0);
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });
  });
};
```

关于 uploadChunks 函数，接收三个参数，最后会返回每个切片的 promise，用于判断切片是否上传完整。这里主要就是遍历每个切片，然后参数的包装和获取，还有进度条的实现。
单纯的上传这样写其实就足够了，但是为了满足上传暂停的功能，我们还需要进一步改造。

## 暂停上传

说到暂停功能，这里采用的也就是取消 axios 请求。当所有请求发送后，由于浏览器处理并发的队列有限制，所以就会有 pending 中的请求，按下暂停键，只需要把这些未上传成功还在 pending 的请求取消即可。

关于取消 axios 请求，大概有两种方式。这里我们采取构造函数，每次生成一个取消方法的实例，然后进行回调取消。前提是需要在 axios 提前封装好，这里不展示具体 axios 封装，可以看我源码。

```js
// 首选引入axios和他内置的方法CancelToken
import axios from "axios";
var CancelToken = axios.CancelToken;
```

接着我们在 uploadChunks 函数中加入一些新的代码,把每个请求封装在 getRequest 函数内，进度条在每次请求成功，即 res 成功时候，会自动增加 1.

```js
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
  //  ......
  //  ......
  //  ......
  let count = 0;
  return data.map(async ({ formData }, index) => {
    let res = await getRequest(formData);
    if (res) {
      count++;
      tableData[index_].percent = ((count / file_filter.length) * 100).toFixed(
        0
      );
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
```

重点看这个 getRequest 封装请求的函数，这里是取消请求的关键：

- 我们在每次请求时候都会生成一个取消的实例用 cancel 变量保存，然后就可以在需要的时候手动触发调用这个方法了。
- 这里需要用到我们全局设置的数组 ReqList 了，每次请求成功后，会根据返回的切片名称，对原数组进行一个过滤。
  注意看这两行代码的位置，上面的是在请求成功回调后执行属于异步代码，说明的已经上传成功的，无须再保存取消函数了；下面的是同步代码，每次请求都会把当前的取消实例和切片名称 chunkName 进行保存。

```js
ReqList = deleCancel(data); //就是对已经成功上传的文件无需保存取消函数实例
ReqList.push({ cancel, key: formData.get("chunkName") });
```

当点击暂停的按钮时候,循环那些还在 pending 中的请求保存的取消函数进行回调，实现取消的效果。

```js
// 暂停上传
const uploadStop = () => {
  // ......
  ReqList.forEach((e) => {
    e.cancel("取消");
  });
};
```

## 秒传和续传

其实这个功能上面已经讲到了，核心就是那个 FindFile_Api 接口，前端这里每次请求前会先请求这个接口,实际上秒传就是一个状态的改变，并没有实际文件的上传，续传也只是根据后端返回的切片存在的名称，这里通过 startUpload 第三个函数传递，然后再次上传时候把这些已经存在的切片过滤 不进行上传即可。

```js
const uploadStart = async (index, file) => {
  // ......
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
```

# 总结

以上是我这次手写整个大文件上传的总结，有许多地方不足，但主体功能算是实现了，也算是一次练习和学习的过程,
源码在这里，可以直接下载查看https://gitee.com/mengjie1234/v3_node。需要数据库表结构和其他问题可以私信我，看到都会回复。
