<template lang="">
  <!-- 弹窗 -->
  <el-dialog
    width="30%"
    :title="data.title"
    :before-close="handleClose"
    v-model="data.dialogFormVisible"
  >
    <el-scrollbar height="400px">
      <el-tree
        ref="tree"
        :data="data.selectList"
        show-checkbox
        :default-expand-all="true"
        :check-strictly="true"
        node-key="id"
        :default-checked-keys="data.menuCheckedKeys"
        :props="data.defaultProps"
      />
    </el-scrollbar>
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
import { defineExpose, reactive, ref } from "vue";
import { roleQueryById_Api, roleUpdate_Api } from "@/api/sys/role";
import { menuList_Api } from "@/api/sys/menu";
import { ElMessage } from "element-plus";
export default {
  emits: ["getList"],
  setup(props, context) {
    const data = reactive({
      dialogFormVisible: false,
      loading: false,
      title: "",
      form: {
        menuIds: '',
        id:''
      },
      menuCheckedKeys:[],
      selectList: [],
      defaultProps: {
        children: "children",
        label: "name",
        value: 'id'
      },
    });
    let tree = ref();
    const doSth = (titel, row) => {
      data.title = titel;
      data.form.id= row.id
      getMenus(row.id);
      data.dialogFormVisible = true;
    };
    const getMenus = async (id) => {
      try {
        let res = await menuList_Api({ istree: true });
        if (res) {
          data.selectList = res.data.records;
          let r = await roleQueryById_Api({ id });
          if (r.data.menuIds) {
            data.menuCheckedKeys = r.data.menuIds.split(',')
            tree.value.setCheckedKeys(data.menuCheckedKeys)
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    const handleClose = () => {
      data.dialogFormVisible = false;
      data.menuCheckedKeys=[]
      data.form = {
        menuIds: '',
        id: ''
      };
    };

    const confirmEdit = async () => {
      try {
         // 半选和全选合并
        data.form.menuIds = [...tree.value.getHalfCheckedKeys(), ...tree.value.getCheckedKeys()].join(',')
        data.loading = true;
        let res = await roleUpdate_Api({
          ...data.form,
        });
        console.log(res, "res");
        data.loading = false;
        context.emit("getList");
          ElMessage({
          message: '请退出后重新登录刷新权限',
          type: "success",
        });
        handleClose();
      } catch (e) {
        data.loading = false;
        console.error(e);
      }

    };

    defineExpose({ doSth });
    return {
      doSth,
      data,
      tree,
      handleClose,
      confirmEdit,
    };
  },
};
</script>
