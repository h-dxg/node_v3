<template lang="">
  <!-- 弹窗 -->
  <el-dialog
    :title="title"
    :before-close="handleClose"
    v-model="dialogFormVisible"
  >
    <div style="margin-top: -25px">
      <el-form
        :disabled="method === 'view'"
        v-loading="loading"
        label-width="100px"
        :model="form"
      >
        <el-row :gutter="20">
          <el-col>
            <el-form-item label="菜单类型">
              <el-radio-group v-model="form.type">
                <el-radio :label="1">目录</el-radio>
                <el-radio :label="2">菜单</el-radio>
                <el-radio :label="3">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="上级菜单">
              <el-tree-select
                :disabled="method === 'addDown'"
                placeholder="请选择菜单名称"
                style="width: 100%"
                check-strictly
                :render-after-expand="false"
                show-checkbox
                check-on-click-node
                v-model="form.pid"
                :data="selectList"
              />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="菜单名称">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="图标">
              <el-input v-model="form.icon" @click="showIcon">
       </el-input>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="排序">
              <el-input-number v-model="form.sort" :min="1" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="路由地址">
              <el-input v-model="form.url" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- 按键操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="method !== 'view'"
          type="primary"
          @click="confirmEdit"
          >确 定</el-button
        >
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
    <IconLog ref="icon" @getIcon='getIcon' />
  </el-dialog>

</template>
<script>
import { defineExpose, reactive ,ref,toRefs} from "vue";
import { menuAdd_Api, menuList_Api, menuUpdate_Api } from "@/api/sys/menu";
import IconLog from '@/components/icon'
import { ElMessage } from "element-plus";
export default {
  emits: ["getList"],
  components:{IconLog},
  setup(props, context) {
    const data = reactive({
      dialogFormVisible: false,
      loading: false,
      title: "",
      method: "",
      selectList: [],
      form: {
        type: 1,
        pid: 0,
      },
    });
   let icon = ref(null);
    const doSth = (titel, method, row) => {
      data.title = titel;
      data.method = method;
      if (data.method !== "add" && data.method !== "addDown") {
        data.form = Object.assign(data.form, row);
      }
      if (data.method === "addDown") data.form.pid = row.id;
      getMenus();
      data.dialogFormVisible = true;
    };
    const handleClose = () => {
      data.dialogFormVisible = false;
      data.form = {};
    };
    const getMenus = async () => {
      try {
        let res = await menuList_Api({ istree: true });
        data.selectList = res.data.records;
      } catch (e) {
        console.error(e);
      }
    };
    const confirmEdit = async () => {
      if (data.method === "add" || data.method === "addDown") {
        try {
          data.loading = true;
          let res = await menuAdd_Api({
            ...data.form,
          });
          console.log(res, "res");
          ElMessage({
            message: "操作成功",
            type: "success",
          });
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
          let res = await menuUpdate_Api({
            ...data.form,
          });
          console.log(res, "res111");
          ElMessage({
            message: "操作成功",
            type: "success",
          });
          data.loading = false;
          context.emit("getList");
          handleClose();
        } catch (e) {
          data.loading = false;
          console.error(e);
        }
      }
    };
    const showIcon = () => {
      console.log('1');
      icon.value.initfn();
    }
    const getIcon = (res) => {
      console.log(res, 'ressss');
      data.form.icon=res
    }
    defineExpose({ doSth });
    return {
      doSth,
      ...toRefs(data),
      handleClose,
      confirmEdit,
      showIcon,
      icon,
      getIcon
    };
  },
};
</script>
