<template>
  <div class="main">
    <div style="padding: 5px">
      <el-button type="primary" @click="getAdminRoles">查询</el-button>
      <el-button type="primary" @click="add">新建</el-button>
    </div>
    <el-table :data="tableData" stripe border style="width: 100%">
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="role_type" label="角色类型" />
      <el-table-column prop="remarks" label="说明" />
      <el-table-column width="180" label="操作">
        <template #default="scope">
           <el-button
              style="margin:5px"
              link
              type="primary"
              @click.prevent="view(scope.row)"
              size="small"
              >查看</el-button
            >
            
          <el-dropdown>
           <el-button  style="margin:5px" link size="small" type="primary">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.prevent="edit(scope.row)">修改</el-dropdown-item>
                <el-dropdown-item @click.prevent="del(scope.row)">删除</el-dropdown-item>
                <el-dropdown-item @click.prevent="showAuth(scope.row)">权限设置</el-dropdown-item>
                <el-dropdown-item @click.prevent="setRole(scope.row)">人员分配</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination :total="totalNum" :background="true" :page-size="pageCount" :current-page="currentPage"
        layout="total, prev, pager, next" @current-change="handleCurrentChange">
      </el-pagination>
    </div>
    <roleForm ref="childRef" @getList="getAdminRoles" />
    <authForm ref="authRef" @getList="getAdminRoles" />
    <userForm ref="userRef" @getList="getAdminRoles" />
  </div>
</template>

<script>
import { ref } from "vue";
import { useRoleList } from "./role-hook";
import { ElMessageBox } from "element-plus";
import roleForm from "./roleForm";
import userForm from "./userForm";
import authForm from "./authForm";


export default {
  components: { roleForm, authForm, userForm },
  setup() {
    const {
      allGroups,
      loading,
      totalNum,
      tableData,
      pageCount,
      currentPage,
      getAdminRoles,
      handleCurrentChange,
      deleteRow,
    } = useRoleList();
    let childRef = ref();
    let authRef = ref();
    let userRef = ref();
    const add = () => {
      childRef.value.doSth("新建", "add");
    };
    const del = (row) => {
      ElMessageBox.confirm("确定删除？?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteRow(row);
        })
        .catch(() => { });
    };
    const view = (row) => {
      childRef.value.doSth("查看", "view", row);
    };
    const edit = (row) => {
      childRef.value.doSth("编辑", "edit", row);
    };
    const showAuth = (row) => {
      authRef.value.doSth("权限设置",  row);
    };
     const setRole = (row) => {
      userRef.value.doSth("人员分配", row);
    };
    
    return {
      allGroups,
      loading,
      totalNum,
      tableData,
      pageCount,
      currentPage,
      getAdminRoles,
      handleCurrentChange,
      childRef,
      authRef,
      userRef,
      add,
      del,
      view,
      edit,
      showAuth,
      setRole
    };
  },
};
</script>
<style></style>
