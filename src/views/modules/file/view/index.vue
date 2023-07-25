<template lang="">
  <div style="padding: 10px">
    <el-row>
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>上传文件夹</span>
              <el-button class="button" @click="add_1" text
                >点击选择文件</el-button
              >
            </div>
          </template>
          <input
            @change="change_1"
            webkitdirectory
            class="upload_input"
            ref="uploadInput"
            type="file"
          />
          <div style="width: 100%; height: 100px; border: 1px dotted #ccc">
            <p v-for="(i, index) in file_list1" :key="index">
              <el-tag> {{ i.name }}</el-tag>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>拖拽上传</span>
              <el-button class="button" @click="add_1" text
                >点击选择文件</el-button
              >
            </div>
          </template>
          <input class="upload_input" ref="uploadInput" type="file" />
          <div
            ref="box"
            style="width: 100%; height: 100px; border: 1px dotted #ccc"
          >
            <p v-for="(i, index) in file_list2" :key="index">
              <el-tag> {{ i.name }}</el-tag>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>预览图片</span>
              <el-button class="button" @click="add_2" text
                >点击选择文件</el-button
              >
            </div>
          </template>
          <input
            @change="change_2"
            class="upload_input"
            ref="viewfile"
            type="file"
          />
          <div
            ref="box"
            style="width: 100%; height: 100px; border: 1px dotted #ccc"
          >
            <p v-for="(i, index) in file_list3" :key="index">
              <el-tag> {{ i.name }}</el-tag>
              <el-link type="primary" @click="viewFile(i)">点击预览</el-link>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top: 30px">
      <el-col :span="1">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>预览水印</span>
              <el-button class="button" @click="add_3" text
                >点击选择文件</el-button
              >
            </div>
          </template>
          <input
            @change="change_3"
            class="upload_input"
            ref="viewfile_c"
            type="file"
          />
          (前端水印，监听dom变化无法获取原图和下载)
          <div
            ref="box"
            style="width: 100%; height: 100px; border: 1px dotted #ccc"
          >
            <p v-for="(i, index) in file_list4" :key="index">
              <el-tag> {{ i.name }}</el-tag>
              <el-link type="primary" @click="viewFile_c(i)">点击预览</el-link>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <modal ref="modals" />
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import modal from "./modal";

let uploadInput = ref();
let viewfile = ref();
let viewfile_c = ref();

let box = ref();
let modals = ref("");

let file_list1 = reactive([]);
let file_list2 = reactive([]);
let file_list3 = reactive([]);
let file_list4 = reactive([]);

const add_1 = () => {
  uploadInput.value.click();
};
const add_2 = () => {
  viewfile.value.click();
};
const add_3 = () => {
  viewfile_c.value.click();
};

const change_1 = () => {
  // uploadInput.value.files 文件对象集合
  file_list1.push(...uploadInput.value.files);
};
const change_2 = () => {
  let file = viewfile.value.files[0];
  if (file.type !== "image/jpeg") {
    alert("请选择图片类型文件上传");
    return false;
  }
  file_list3.push(file);
};
const change_3 = () => {
  let file = viewfile_c.value.files[0];
  if (file.type === "image/jpeg") {
    file_list4.push(file);
  } else {
    alert("请选择图片类型文件");
    return false;
  }
};
const viewFile = (file) => {
  // 文件对象二进制
  const reader = new FileReader();
  reader.readAsDataURL(file); //读取二进制文件对象 异步
  reader.onload = (e) => {
    // console.log(e.target.result, 'reader'); //得到base64
    modals.value.init(e.target.result, "1");
  };
};
const viewFile_c = (file) => {
  // 文件对象二进制
  let base=''
  const reader = new FileReader();
  reader.readAsDataURL(file); //读取二进制文件对象 异步
  reader.onload = (e) => {
    // console.log(e.target.result, 'reader'); //得到base64
    let base=e.target.result
    modals.value.init(base, "2",file.type);
  };
};

onMounted(() => {
  box.value.ondragenter = (e) => {
    console.log("111");
    e.preventDefault();
  };
  box.value.ondragover = (e) => {
    console.log("222");
    e.preventDefault();
  };
  box.value.ondrop = (e) => {
    // 获取文件信息
    //console.log('e', e.dataTransfer.items); //拖拽的所有文件
    for (let item of e.dataTransfer.items) {
      const res = item.webkitGetAsEntry();
      // res.isFile 是否文件夹
      file_list2.push(res);
    }
    e.preventDefault();
  };
});
</script>
<style lang="scss">
.upload_input {
  display: none !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 18px;
  color: #007aff;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 480px;
}
</style>
