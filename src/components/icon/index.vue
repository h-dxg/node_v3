<template>
  <el-dialog
    :title="data.title"
    :before-close="handleClose"
    v-model="data.dialogFormVisible"
  >
    <div>
      <ul class="icon-list">
        <li v-for="(item, index) in data.list" :key="index">
          <el-icon style="font-size: 30px" @click="iconActiveHandle(item)">
            <component :is="item" />
          </el-icon>
        </li>
      </ul>
    </div>
  </el-dialog>
</template>

<script setup>
import { reactive, defineExpose,defineEmits } from "vue";
import iconList from "./iconList";
let data = reactive({
  title: "图标",
  dialogFormVisible: false,
  list: iconList,
});
const initfn = () => {
  data.dialogFormVisible = true;
};
const emit = defineEmits(['getIcon'])
const handleClose = () => {
  data.dialogFormVisible = false;
 
};

const iconActiveHandle = async (item) => {
  console.log(item, "itemitem");
   emit('getIcon',item)
  data.dialogFormVisible = false;
};
defineExpose({ initfn });
</script>

<style scoped>
ul {
  margin: 10px 0;
  padding: 0 0 0 20px;
  font-size: 14px;
  color: #5e6d82;
  line-height: 2em;
}

ul.icon-list {
  overflow: hidden;
  list-style: none;
  padding: 0 !important;
  border: 1px solid #eaeefb;
  border-radius: 4px;
}
.icon-list li {
  float: left;
  width: 10%;
  text-align: center;
  height: 50px;
  line-height: 70px;
  color: #666;
  font-size: 13px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-right: -1px;
  margin-bottom: -1px;
}
.icon-list li :hover{
  color: #c72c2c;
}
</style>
