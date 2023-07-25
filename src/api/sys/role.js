import request from '@/request'
export function roleList_Api (params) {
  return request({
    url: '/sys/role/rolelist',
    method: 'get',
    params
  }, { loading: false })
}
export function roleQueryById_Api (params) {
  return request({
    url: '/sys/role/queryById',
    method: 'get',
    params
  }, { loading: false })
}
export function roleAdd_Api (data) {
  return request({
    url: '/sys/role/roleAdd',
    method: 'post',
    data
  }, { loading: false })
}
export function roleUsetList_Api (params) {
  return request({
    url: '/sys/role/user/list',
    method: 'get',
    params
  }, { loading: false })
}
export function roleUsetDel_Api (params) {
  return request({
    url: '/sys/role/user/del',
    method: 'delete',
    params
  }, { loading: false })
}

export function roleDel_Api (params) {
  return request({
    url: '/sys/role/roleDel',
    method: 'delete',
    params
  }, { loading: false })
}
export function roleUpdate_Api (data) {
  return request({
    url: '/sys/role/roleUpdate',
    method: 'post',
    data
  }, { loading: false })
}
export function roleUserAdd_Api (data) {
  return request({
    url: '/sys/role/user/add',
    method: 'post',
    data
  }, { loading: false })
}