import { defineStore } from 'pinia'
import { getMenus } from "@/api/sys/user";
import { getLocal, setLocal, clearLocal } from "@/utils";

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useCommon = defineStore('common', {
  // other options...
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      menuList: getLocal("menusList") || false,//前端路由菜单
      IsAsync: true,//是否动态路由
      IsHasAuth: getLocal("IsHasAuth") || false,//是否获取权限
      userInfo: getLocal("userInfo"),//登录用户信息
    }
  },
  getters: {

  },
  actions: {
    async loginOut () {
      clearLocal('token', true)
      this.IsHasAuth = false
      window.location.reload();
    },
    async getMenusList () {
      //异步操作 动态获取菜单
      try {
        let { data } = await getMenus()
        this.menuList = getMenu(data.menusList)
        this.IsHasAuth = true
        this.userInfo = data.usefInfo
        setLocal(this.userInfo, "userInfo")
        setLocal(this.IsHasAuth, "IsHasAuth")
        return this.menuList
      } catch (error) {
        console.log(error);
      }
    },
    async getMenusListLocal (mainRoutes) {
      //异步操作 获取前端菜单路由
      // 自动完成 
      // 当前不是动态路由 直接取配置项中的路由
      this.menuList = getMenu_local(mainRoutes)
      this.IsHasAuth = true
      setLocal(this.IsHasAuth, "IsHasAuth")
    },
  }
})
// 本地格式化菜单
const getMenu_local = (menu, path) => {
  const item = []
  for (let i = 0; i < menu.length; i++) {
    let map = {}
    map.title = menu[i].meta.title
    map.name = menu[i].name
    map.path = path ? path + menu[i].path : menu[i].path
    if (menu[i].children && menu[i].children.length > 0) {
      map.children = getMenu(menu[i].children, `${map.path}/`)
    }
    item.push(map)
  }
  return item
}
// 动态格式化菜单
const getMenu = (menu) => {
  const item = []
  for (let i = 0; i < menu.length; i++) {
    let map = {}
    let p = menu[i].url.split('/')
    map.title = menu[i].name
    map.name = p.slice(-1)[0]
    map.path = menu[i].url
    map.icon = menu[i].icon
    if (menu[i].children && menu[i].children.length > 0) {
      map.children = getMenu(menu[i].children)
    }
    item.push(map)
  }
  return item
}