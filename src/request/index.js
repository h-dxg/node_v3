import { ElLoading, ElMessage } from "element-plus";
import axios from "axios";
import qs from "qs";
import { getLocal, clearLocal } from "@/utils";

const pendingMap = new Map();
/**
 * 生成每个请求唯一的键
 * @param {*} config
 * @returns string
 */
function getPendingKey(config) {
  let { url, method, params, data } = config;
  // if (typeof data === 'string') data = JSON.parse(data); // response里面返回的config.data是个字符串对象
  return [url, method, params, data].join("&");
}
/**
 * 储存每个请求唯一值, 也就是cancel()方法, 用于取消请求
 * @param {*} config
 */
// 判断重复请求并储存进队列
function addPending(config) {
  const pendingKey = getPendingKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pendingMap.has(pendingKey)) {
        pendingMap.set(pendingKey, cancel);
      }
    });
}

/**
 * 删除重复的请求
 * @param {*} config
 */
// 取消重复请求并出删除队列
function removePending(config) {
  const pendingKey = getPendingKey(config);
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey);
    cancelToken(pendingKey);
    pendingMap.delete(pendingKey);
  }
}

const LoadingInstance = {
  _target: null, // 保存Loading实例
  _count: 0,
};
function request(options, customOptions, cancel = {}) {
  // 自定义配置 是否开启取消请求
  let custom_options = Object.assign(
    {
      repeat_request_cancel: true, // 是否开启取消重复请求, 默认为 true
      loading: true, // 是否开启loading层效果, 默认为false
    },
    customOptions
  );

  // create an axios instance
  const service = axios.create({
    baseURL: process.env.NODE_ENV !== 'production' ? process.env.VUE_APP_BASE_API : process.env.VUE_APP_BASE_API, //服务器地址
    timeout: 300000, // request timeout
    // paramsSerializer: function (params) {
    //   return qs.stringify(params, { arrayFormat: "repeat" });
    // },
  });

  // service.defaults.headers["Content-Type"] =
  //   "application/x-www-form-urlencoded; charset=utf-8";
  service.defaults.headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  // 请求拦截器
  service.interceptors.request.use(
    function (config) {
      // config.cancelToken = source.token;
      if (JSON.stringify(cancel) !== "{}") {
        config.cancelToken = cancel.cancelToken;
      }
      if (custom_options.repeat_request_cancel) {
        removePending(config);
        addPending(config);
      }
      // 创建loading实例
      if (custom_options.loading) {
        LoadingInstance._count++;
        if (LoadingInstance._count === 1) {
          LoadingInstance._target = ElLoading.service();
        }
      }
      if (getLocal("token")) {
        config.headers.Authorization = "Bearer " + getLocal("token");
      }
      const type = config.method;
      const arrayFormat = config.headers.arrayFormat || "indices";
      if (
        type === "post" &&
        config.headers["Content-Type"] ===
        "application/x-www-form-urlencoded; charset=utf-8"
      ) {
        // console.log('post');
        // post请求参数处理
        config.data = qs.stringify(config.data, {
          allowDots: true,
          arrayFormat: arrayFormat,
        });
        // console.log(config.data, " config.data config.data");
      } else if (type === "get") {
        // get请求参数处理
        config.paramsSerializer = (params) => {
          return qs.stringify(params, {
            allowDots: true,
            arrayFormat: arrayFormat,
          });
        };
      }
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  service.interceptors.response.use(
    function (response) {
      //配置请求回来的信息
      removePending(response.config);
      custom_options.loading && closeLoading(custom_options); // 关闭loading
      return response;
    },
    function (error) {
      error.config && removePending(error.config);
      custom_options.loading && closeLoading(custom_options); // 关闭loading
      httpErrorStatusHandle(error); // 处理错误状态码
      return Promise.reject(error); // 错误继续返回给到具体页面
    }
  );
  return service(options);
}
function httpErrorStatusHandle(error) {
  // 处理被取消的请求
  if (axios.isCancel(error))
    return console.error("请求的重复请求：" + error.message);
  let message = "";
  if (error && error.response) {
    switch (error.response.status) {
      case 302:
        message = "接口重定向了！";
        break;
      case 400:
        message = "参数不正确！";
        break;
      case 401:
        message = "您未登录，或者登录已经超时，请先登录！";
        clearLocal("token", true); //清空缓存刷新页面
        window.location.reload();
        break;
      case 403:
        message = "您没有权限操作！";
        break;
      case 404:
        message = `请求地址出错: ${error.response.config.url}`;
        break; // 在正确域名下
      case 408:
        message = "请求超时！";
        break;
      case 409:
        message = "系统已存在相同数据！";
        break;
      case 500:
        message = `${error.response.data.error ? error.response.data.error : '服务器内部错误！'}`;
        break;
      case 501:
        message = "服务未实现！";
        break;
      case 502:
        message = "网关错误！";
        break;
      case 503:
        message = "服务不可用！";
        break;
      case 504:
        message = "服务暂时无法访问，请稍后再试！";
        break;
      case 505:
        message = "HTTP版本不受支持！";
        break;
      default:
        message = "异常问题，请联系管理员！";
        break;
    }
  }
  if (error.message.includes("timeout")) message = "网络请求超时！";
  if (error.message.includes("Network"))
    message = window.navigator.onLine ? "服务端异常！" : "您断网了！";

  ElMessage({
    type: "error",
    message,
  });
}
/**
 * 关闭Loading层实例
 * @param {*} _options
 */
function closeLoading(_options) {
  if (_options.loading && LoadingInstance._count > 0) LoadingInstance._count--;
  if (LoadingInstance._count === 0) {
    LoadingInstance._target.close();
    LoadingInstance._target = null;
  }
}
// source.cancel("Operation canceled by the user.");
export default request;
