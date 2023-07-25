import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { getLocal, clearLocal, setLocal } from '@/utils'
import { useCommon } from "@/store/modules/common";
// 白名单路由(当前列表菜单不可配置)

const globalRoutes = [
  {
    path: '/',
    redirect: '/login',
    // name: 'login',
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/views/modules/home/404.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login'),
  },
]
//页面功能菜单模块，可动态配置获取，也可本地前端配置
export const mainRoutes = [
  { path: '/home', name: 'home', component: () => import('@/views/modules/home/index'), meta: { title: '首页' }, },
  // {
  //   path: '/sys', name: 'sys', meta: { title: '系统管理' },
  //   children: [
  //     {
  //       path: 'user', component: () => import('@/views/modules/sys/user'), name: 'user', meta: { title: '用户管理' }
  //     },
  //     {
  //       path: 'role', component: () => import('@/views/modules/sys/role'), name: 'role', meta: { title: '角色管理' }
  //     },
  //     {
  //       path: 'menu', component: () => import('@/views/modules/sys/menu'), name: 'menu', meta: { title: '菜单管理' },
  //     },
  //     {
  //       path: 'authority', component: () => import('@/views/modules/sys/authority'), name: 'authority', meta: { title: '权限管理' },
  //     }
  //   ]
  // }
  // ......
]
// 页面主要路由
const mainRoute = [
  {
    path: '/', redirect: { name: 'home' }, component: () => import(/* webpackChunkName: "content" */'@/views/layout'), name: 'layout', meta: { title: '基础布局' },
    children: mainRoutes
  },
]
const router = createRouter({    // 定义一个路由器s
  // history: createWebHashHistory(),
  history: createWebHistory('/'),
  routes: globalRoutes.concat(mainRoute)
});

router.beforeEach(async (to, from, next) => {
  let store = useCommon();
  let IsHasAuth = store.IsHasAuth //是否已经添加动态(菜单)路由
  let token = getLocal('token') || ''
  // 白名单
  if (globalRoutes.find(e => e.path === to.path)) {
    next()
  } else {
    if (!token || !/\S/.test(token)) { // token为空，跳转到login登录
      clearLocal('token', true)
      if (to.name === 'login') {
        next()
      } else {
        next({ name: 'login' })
      }
    } else if (IsHasAuth) {
      // console.log('有权限通过');
      next()
    } else {
      try {
        // console.log('没权限，需要接口获取');
        let IsAsync = store.IsAsync //是否动态路由或者前端路由
        if (IsAsync) {
          let res = await store.getMenusList()
          if (res) {
            setLocal(res, "menusList")
            fnAddDynamicMenuRoutes(res)
            // console.log(router.getRoutes(), 'router.getRoutes()');
          }
        } else {
          store.getMenusListLocal(mainRoutes)
        }
        next()
      } catch (error) {
        next({ name: 'login' })
      }
    }
  }

})

/**
 * 添加动态(菜单)路由
 * @param {*} menuList 菜单列表
 * @param {*} routes 递归创建的动态(菜单)路由
 */
export function fnAddDynamicMenuRoutes (menuList = []) {
  if (!menuList || menuList.length === 0) return
  // let temp = []
  for (let i = 0; i < menuList.length; i++) {
    let row = menuList[i]
    let route = {
      name: row.name,
      path: row.path,
      component: null,
      meta: {
        title: row.title
      }
    }
    try {
      if (row.path) {
        route.component = () => import(`@/views/modules${row.path}`)
      }
    } catch (e) {
      console.log(e)
    }
    if (row.children && row.children.length > 0) {
      route.children = fnAddDynamicMenuRoutes(row.children)
    }
    // 动态添加路由
    router.addRoute('layout', route)
  }
}
//router实例挂载之前先调用一次，用于生成路由缓存，防止刷新页面丢失路由信息 404
fnAddDynamicMenuRoutes(getLocal("menusList"))
export default router;