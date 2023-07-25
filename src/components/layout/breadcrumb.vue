<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(i, index) in resultPath" :key="index">{{
        i.title
      }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { watch, reactive } from "vue";
import { useRoute } from "vue-router";
import { getLocal } from "@/utils";
const route = useRoute();
let resultPath = reactive([]);
watch(
  () => route.path,
  (v) => {
    resultPath.length = 0;
    getPath(v);
  }
);
const getPath = (v) => {
  let paths = v.split("/");
  paths.shift();
  let list = getLocal("menusList")||[];
  paths.forEach((e) => {
    resultPath.push(...dep(list, e, []));
  });
  function dep(list, key, result) {
    list.forEach((e) => {
      if (e.name === key) {
        result.push(e);
      }
      if (e.children && e.children.length > 0) {
        dep(e.children, key, result);
      }
    });
    return result;
  }
};
</script>

<style lang="scss">

</style>
