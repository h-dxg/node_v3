<template lang="">
  <!-- 弹窗 -->
  <el-dialog
    :title="data.title"
    :before-close="handleClose"
    v-model="data.dialogFormVisible"
  >
    <div style="margin-top: -25px">
      <el-tabs v-model="data.activeTab">
        <el-tab-pane label="基本信息" name="基本信息">
          <el-form
            :disabled="data.method === 'view'"
            v-loading="data.loading"
            label-width="100px"
            :model="data.form"
          >
            <el-row :gutter="20">
              <el-col>
                <el-form-item label="用户名">
                  <el-input v-model="data.form.user_name" />
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item label="登录名">
                  <el-input v-model="data.form.loginName" />
                </el-form-item>
              </el-col>
              <el-col v-if="data.method === 'add'">
                <el-form-item label="用户名密码">
                  <el-input
                    type="password"
                    placeholder="请输入密码"
                    show-password
                    v-model="data.form.login_password"
                  />
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item label="所属角色">
                  <el-select
                   :disabled="data.method !== 'add'"
                    v-model="data.form.roleIds"
                    multiple
                    placeholder="请选择角色"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in data.options"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="修改密码"> </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 按键操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="data.method !== 'view'"
          type="primary"
          @click="confirmEdit"
          >确 定</el-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import { defineExpose, reactive } from "vue";
import { userAdd_Api, userUpdate_Api, userInfo_Api } from "@/api/sys/user";
import { roleList_Api } from "@/api/sys/role";
export default {
  emits: ["getList"],
  setup(props, context) {
    const data = reactive({
      activeTab: "基本信息",
      dialogFormVisible: false,
      loading: false,
      title: "",
      method: "",
      options: [],
      form: {
        user_name: "",
        user_number: 1,
        roleIds: [],
      },
    });
    const doSth = (titel, method, row) => {
      console.log("子组件的 doSth 方法执行了！");
      getRole();
      data.title = titel;
      data.method = method;
      if (data.method !== "add") {
        setTimeout(() => {
            getUserInfo(row.user_id)
        },100)
      
      }
      data.dialogFormVisible = true;
    };
    const getUserInfo= async (id) => {
      try {
        let res = await userInfo_Api(id);
        if (res) {
          console.log(res,'res');
          console.log(res.data.records.roleIds,' res.data.records.roleIds');
          data.form = Object.assign(data.form, res.data.records);
          data.form.roleIds = res.data.records.roleIds.split(",").map(Number)
        }
      } catch (e) {
        console.error(e);
      }
    };
    const getRole = async () => {
      try {
        let res = await roleList_Api({
          count: 999,
          page: 1,
        });
        data.options = res.data.records;
      } catch (e) {
        console.error(e);
      }
    };

    const handleClose = () => {
      data.dialogFormVisible = false;
      data.form = {
        user_name: "",
        user_number: 1,
        roleIds: [],
      };
    };

    const confirmEdit = async () => {
      console.log({ ...data.form }, "formform");
      if (data.method === "add") {
        try {
          data.loading = true;
          data.form.roleIds = data.form.roleIds.join(",");
          console.log(data.form.roleIds, "  data.form.roleIdList");
          let res = await userAdd_Api({
            ...data.form,
          });
          console.log(res, "res");
          data.loading = false;
          context.emit("getList");
          handleClose();
        } catch (e) {
          data.loading = false;
          console.error(e);
        }
      } else {
        // 编辑
        try {
          data.loading = true;
          data.form.roleIds = data.form.roleIds.join(",");
          console.log(data.form.roleIds, "  data.form.roleIdList");
          let res = await userUpdate_Api({
            ...data.form,
          });
          console.log(res, "res");
          data.loading = false;
          context.emit("getList");
          handleClose();
        } catch (e) {
          data.loading = false;
          console.error(e);
        }
      }
    };
    defineExpose({ doSth });
    return {
      doSth,
      data,
      handleClose,
      confirmEdit,
    };
  },
};
</script>
