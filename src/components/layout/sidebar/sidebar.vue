<template>
  <div class="app-sidebar">
    <logo :elMenuCollapse="elMenuCollapse" />
    <div :style="{ 'margin-bottom': '50px', height: height }">
      
      <el-menu
        ref="meun"
        class="el-menu-vertical-demo"
        :default-active="defaultActive"
        :collapse="elMenuCollapse"
        background-color="#192A5E"
        text-color="rgba(196,201,210,1)"
        active-text-color="#1890ff"
      >
      <!-- {{ store.sidebarList }} { title:"首页" , name: "home",path: "/home"}  [{name:'home',title:'首页',path:'/home'}] -->
      <div v-for="item in store.menuList " :key="item.path" >
        <menu-tree :elMenuCollapse="elMenuCollapse" :item="item"></menu-tree>
      </div>
      </el-menu>
    </div>
  </div>
</template>

<script>

import { useCommon } from "@/store/modules/common";
import Logo from "./logo";
import MenuTree from "./menu-tree";
import { reactive, defineComponent } from "vue";
export default defineComponent({
  components: { MenuTree, Logo },
  props: {
    height: {
      type: String,
      default: document.body.clientHeight,
    },
    isPhone: {
      type: Boolean,
      default: false,
    },
    isCollapse: {
      type: Boolean,
      default: false,
    },
  },
  setup () {
    let store = useCommon();
    let data = reactive({
      sidebarList: []
    });

    data.sidebarList = store.menuList;
    console.log(data.sidebarList ,'data.sidebarList ');
    return {
      store,
    };
  },
  computed: {
    elMenuCollapse () {
      if (this.isPhone) {
        return false;
      }
      return this.isCollapse;
    },
    /**
     * 根据当前路由设置激活侧边栏
     */
    defaultActive () {
      const route = this.$route;
      return route.path;
    },
  },  
})

</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}

.app-sidebar {
  height: 100%;
  background: #192a5e;

  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
}
</style>
