<template lang="">
  <!-- 弹窗 -->
  <el-dialog
    title="预览"
    :before-close="handleClose"
    v-model="dialogFormVisible"
  >
    <div v-if="type_ === '1'" style="margin-top: 25px">
      <img :src="src" alt="" />
    </div>
    <div v-if="type_ === '2'" ref='echartsWrapper'>
       <waterMark text='防止篡改' fontSize='20' :src="src" :clientWidth='clientWidth' > 
       </waterMark>
    </div>
    <!-- 按键操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { defineExpose, ref,computed,watchEffect } from "vue";
import waterMark from "./waterMark";

let dialogFormVisible = ref(false);
let src = ref("");
let type_ = ref("");
let type_f = ref(false);
let echartsWrapper = ref("");
let clientWidth = ref('')

watchEffect(() => {
  // 监听是否挂载完成 防止篡改
  if (!echartsWrapper.value) {
    return;
  }
  clientWidth.value = echartsWrapper.value.clientWidth
});
computed(() => {
  return this.$refs.echartsWrapper.clientWidth
})

const init = (i, type, type_file) => {
  dialogFormVisible.value = true;
  type_.value = type;
  switch (type_.value) {
    case "1":
      src.value = i;
      break;
    case "2":
      src.value = i;
      if (type_file === "image/jpeg") {
        type_f.value = false;
      } else {
        type_f.value = true;
      }

      break;
  }
};
const handleClose = () => {
  dialogFormVisible.value = false;
};
defineExpose({ init });
</script>
