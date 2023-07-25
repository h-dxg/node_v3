
// 获取
export function getLocal(key = 'STORAGE_USER_KEY') {
  // console.log('get local operation')
  return JSON.parse(window.localStorage.getItem(key))
}
// 清空缓存
export function clearLocal(key = 'STORAGE_USER_KEY', isAll = false) {
  // removeItem()：从 localStorage 中删除指定的键值对
  // clear()：清空 localStorage 中所有键值对
  if (isAll) {
    return window.localStorage.clear()
  }
  // console.log('get local operation')
  return window.localStorage.removeItem(key)
}
// 设置用
/**
 * @param {any} res
 */
export function setLocal(res, key = 'STORAGE_USER_KEY', isSaveOldData = false) {
  //第三个参数是true的话,会增加数据而不是重新设置,res必须是数组
  if (isSaveOldData) {
    if (this.getLocal(key)) {
      let oldData = this.getLocal(key);
      return window.localStorage.setItem(key, JSON.stringify(oldData.concat(res)))
    }
  }
  return window.localStorage.setItem(key, JSON.stringify(res))
}

export function getUUid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export default { getLocal, clearLocal, setLocal, getUUid }