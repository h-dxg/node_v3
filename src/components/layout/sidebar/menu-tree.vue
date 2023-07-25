<template>
   <el-sub-menu v-if="item.children?.length > 0" :index="item.path" popper-append-to-body>
    <template #title>
        <el-icon style="font-size: 18px" >
            <component :is="item.icon" />
          </el-icon>
           <span v-if="!elMenuCollapse">{{ item.title }}</span>
    </template>
    <menu-tree v-for="child in item.children" :key="child.path" :item="child" />
  </el-sub-menu> 
   <el-menu-item v-else :index="item.path" @click="navigateTo(item)">
    <template #title><span class="title">{{ item.title }}</span></template>
  </el-menu-item>
</template>
<script setup>

import { useRouter } from "vue-router";
import { defineProps } from "vue";

const router = useRouter();
defineProps({
  item: Object,
  elMenuCollapse:Boolean

})
const navigateTo = (item) => {
  console.log(item, 'item');
  router.push({ path:item.path })
}

</script>

<style lang="scss" scoped>
.menu_ {
  padding: 0 20px !important;
  color: rgb(196 201 210);
  line-height: 50px;
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif;
  font-weight: normal;
  vertical-align: baseline
}

.icon {
  float: right;
}

// .img-icon {
//   width: 16px;
//   height: 16px;
//   margin-right: 10px;
//   margin-left: 5px;
//   display: inline-block;
//   transform: translateY(21px);
// }

// .iconfont {
//   margin-right: 10px;
//   margin-left: 5px;
//   color: $sub-menu-title;
//   height: $menu-item-height;
// }

// .title {
//   display: inline-block;
//   width: 110px;
//   @include no-wrap();
// }</style>
