import request from "@/request";
export function userList_Api(params) {
  return request(
    {
      url: "/sys/user/userlist",
      method: "get",
      params,
    },
    { loading: false }
  );
}
export function userInfo_Api(id) {
  return request(
    {
      url: "/sys/user/userInfo",
      method: "get",
      params: { id },
    },
    { loading: false }
  );
}

export function userAdd_Api(data) {
  return request(
    {
      url: "/sys/user/userAdd",
      method: "post",
      data,
    },
    { loading: false }
  );
}
export function userDel_Api(params) {
  return request(
    {
      url: "/sys/user/userDel",
      method: "delete",
      params,
    },
    { loading: false }
  );
}
export function userUpdate_Api(data) {
  return request(
    {
      url: "/sys/user/userUpdate",
      method: "post",
      data,
    },
    { loading: false }
  );
}
export function getMenus() {
  return request(
    {
      url: "/sys/user/getMenus",
      method: "get",
    },
    { loading: false }
  );
}
