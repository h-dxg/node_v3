<template lang="">
  <!-- 弹窗 -->
  <el-dialog
    :title="data.title"
    :before-close="handleClose"
    v-model="data.dialogFormVisible"
  >
    <div style="margin-top: -25px">
      <el-form
        :disabled="data.method === 'view'"
        v-loading="data.loading"
        label-width="100px"
        :model="data.form"
      >
        <el-row :gutter="20">
          <el-col>
            <el-form-item label="角色名称">
              <el-input v-model="data.form.name" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="角色类型">
              <el-input v-model="data.form.role_type" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="备注">
              <el-input
                v-model="data.form.remarks"
                :rows="5"
                type="textarea"
                placeholder="请填写备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
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
import { roleAdd_Api, roleUpdate_Api } from "@/api/sys/role";
export default {
  emits: ["getList"],
  setup(props, context) {
    const data = reactive({
      activeTab: "基本信息",
      dialogFormVisible: false,
      loading: false,
      title: "",
      method: "",
      form: {
        name: "",
        role_type: "",
        remarks: "",
      },
    });
    const doSth = (titel, method, row) => {
      data.title = titel;
      data.method = method;
      if (data.method !== "add") {
        data.form = Object.assign(data.form, row);
      }
      data.dialogFormVisible = true;
      console.log(data.dialogFormVisible, "data");
    };

    const handleClose = () => {
      data.dialogFormVisible = false;
      data.form = {
        name: "",
        role_type: "",
        remarks: "",
      };
    };

    const confirmEdit = async () => {
      console.log({ ...data.form }, "formform");
      if (data.method === "add") {
        try {
          data.loading = true;
          let res = await roleAdd_Api({
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
          let res = await roleUpdate_Api({
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
