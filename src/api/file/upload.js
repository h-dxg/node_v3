import request from "@/request";
export function FileList_Api(params) {
  // 查询文件列表
  return request(
    {
      url: "/file/upload/list",
      method: "get",
      params,
    },
    { loading: false }
  );
}
export function FileDel_Api(params) {
  return request(
    {
      url: "/file/upload/del",
      method: "delete",
      params,
    },
    { loading: false }
  );
}
export function AddFile_Api(data, options, cancel) {
  // 上传文件接口
  return request(
    {
      url: "/file/upload",
      method: "post",
      data,
    },
    options,
    cancel //是否取消请求配置项
  );
}
export function EndFile_Api(data) {
  // 合并文件
  return request(
    {
      url: "/file/upload/end",
      method: "post",
      data,
    },
    //取消重复请求的拦截
    { repeat_request_cancel: false, loading: false }
  );
}
export function FindFile_Api(params) {
  // 预检测文件
  return request(
    {
      url: "/file/upload/find",
      method: "get",
      params,
    },
    //取消重复请求的拦截
    { repeat_request_cancel: false, loading: false }
  );
}
