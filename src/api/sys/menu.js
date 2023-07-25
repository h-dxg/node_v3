import request from "@/request";
export function menuAdd_Api(data) {
  return request(
    {
      url: "/sys/menu/menuAdd",
      method: "post",
      data,
    },
    { loading: false }
  );
}
export function menuList_Api(params) {
  return request(
    {
      url: "/sys/menu/menulist",
      method: "get",
      params,
    },
    { loading: false }
  );
}
export function menuUpdate_Api(data) {
  return request(
    {
      url: "/sys/menu/menuUpdate",
      method: "post",
      data,
    },
    { loading: false }
  );
}
export function menuDel_Api(params) {
  return request(
    {
      url: "/sys/menu/menuDel",
      method: "delete",
      params,
    },
    { loading: false }
  );
}
