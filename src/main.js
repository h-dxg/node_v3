import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";

// import store from "@/store1";
import store from "@/store";

import request from "@/request";
import util from "@/utils";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/assets/style/realize/element-variable.scss";
import "@/assets/style/index.scss";
import VXETable from "vxe-table";
import "vxe-table/lib/style.css";
import LinNotify from "@/components/notify";
import select from "@/components/select";
import svgIcon from '@/components/svgIcon' //引入svg

const app = createApp(App);
function useTable(app) {
  app.use(VXETable);
  // 给 vue 实例挂载内部对象，例如：
  // app.config.globalProperties.$XModal = VXETable.modal
  // app.config.globalProperties.$XPrint = VXETable.print
  // app.config.globalProperties.$XSaveFile = VXETable.saveFile
  // app.config.globalProperties.$XReadFile = VXETable.readFile
}

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.config.globalProperties.$http = request;
app.config.globalProperties.$util = util;
app.use(LinNotify, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});
app.use(useTable);
app.use(select);
app.use(svgIcon);
app.use(ElementPlus);
app.use(router);
app.use(store);
app.mount("#app");
