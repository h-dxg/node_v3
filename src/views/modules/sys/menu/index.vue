<template>
  <div class="main">
    <div style="padding: 5px">
      <el-button type="primary" @click="getMenus">查询</el-button>
      <el-button type="primary" @click="add">新建</el-button>
    </div>
    <vxe-table
      size="small"
      border
      show-overflow
      show-header-overflow
      :column-config="{ resizable: true }"
      align="center"
      :tree-config="{
        transform: true,
        rowField: 'id',
        parentField: 'pid',
        accordion: true,
      }"
      :data="tableData"
    >
      <vxe-column type="checkbox" width="50"></vxe-column>
      <vxe-column tree-node field="name" title="名称"></vxe-column>
      <vxe-column field="icon" title="图标"></vxe-column>
      <vxe-column field="type" title="类型" :formatter="formatterNum">
      </vxe-column>
      <vxe-column field="url" title="菜单路由"></vxe-column>
      <vxe-column field="state" title="是否显示"></vxe-column>
      <vxe-column title="操作">
        <template #default="{ row, rowIndex }">
          <el-button
            link
            style="margin: 5px"
            @click.prevent="view(row)"
            type="primary"
            size="small"
            >查看</el-button
          >
          <el-dropdown>
            <el-button link size="small" type="primary">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.prevent="addDown(row)"
                  >添加下级菜单</el-dropdown-item
                >
                <el-dropdown-item @click.prevent="edit(row)"
                  >修改</el-dropdown-item
                >
                <el-dropdown-item @click.prevent="del(row)"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
  <menuForm ref="childRef" @getList="getMenus" />
</template>
<script>
import { reactive, ref } from "vue";
import { useMenuList } from "./menu-hook";
import { ElMessageBox } from "element-plus";
import menuForm from "./menuForm";
export default {
  components: { menuForm },
  setup() {
    const { getMenus, tableData, deleteRow } = useMenuList();
    const formatterNum = ({ cellValue }) => {
      console.log(cellValue, "cellValue");
      let obj = {
        1: "目录",
        2: "菜单",
        3: "按钮",
      };
      return obj[cellValue];
    };
    let childRef = ref();
    const add = () => {
      childRef.value.doSth("新建", "add");
    };
    const view = (row) => {
      childRef.value.doSth("查看", "view", row);
    };
    const edit = (row) => {
      childRef.value.doSth("编辑", "edit", row);
    };
    const addDown = (row) => {
      childRef.value.doSth("添加下一级", "addDown", row);
    };
    const del = (row) => {
      ElMessageBox.confirm("确定删除该菜单及其子节点所有菜单？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteRow(row);
        })
        .catch(() => {});
    };
    return {
      tableData,
      add,
      view,
      edit,
      addDown,
      del,
      getMenus,
      childRef,
      formatterNum,
    };
  },
};
</script>
<style scoped></style>
