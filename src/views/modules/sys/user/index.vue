<template>
  <div class="main">
    <div style="padding: 5px">
      <el-button type="primary" @click="getAdminUsers">查询</el-button>
      <el-button type="primary" @click="add">新建</el-button>
    </div>
    <el-table :data="tableData" stripe border style="width: 100%">
      <el-table-column prop="user_id" label="用户id" />
      <el-table-column prop="loginName" label="登录名" />
      <el-table-column prop="user_name" label="用户名" />
      <el-table-column fixed="right" label="操作">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click.prevent="view(scope.row)"
            size="small"
            >查看</el-button
          >
          <el-button
            link
            type="primary"
            @click.prevent="edit(scope.row)"
            size="small"
            >编辑</el-button
          >
          <el-button
            link
            type="primary"
            size="small"
            @click.prevent="del(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        :total="totalNum"
        :background="true"
        :page-size="pageCount"
        :current-page="currentPage"
        layout="total, prev, pager, next"
        @current-change="handleCurrentChange"
      >
      </el-pagination>
    </div>
    <userForm ref="childRef" @getList="getAdminUsers" />
  </div>
</template>

<script>
import { ref } from "vue";
import { useUserList } from "./user-hook";
import { ElMessageBox } from "element-plus";
import userForm from "./userForm";

export default {
  components: { userForm },
  setup() {
    const {
      allGroups,
      loading,
      totalNum,
      tableData,
      pageCount,
      currentPage,
      getAdminUsers,
      handleCurrentChange,
      deleteRow,
    } = useUserList();
    let childRef = ref();

    const add = () => {
      // 第三步： 调用子组件的方法或者变量，通过value
      childRef.value.doSth("新建", "add");
    };
    const del = (row) => {
      ElMessageBox.confirm("确定删除？?", "Warning", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          deleteRow(row);
        })
        .catch(() => {});
    };
    const view = (row) => {
      // 第三步： 调用子组件的方法或者变量，通过value
      childRef.value.doSth("查看", "view", row);
    };
    const edit = (row) => {
      // 第三步： 调用子组件的方法或者变量，通过value
      childRef.value.doSth("编辑", "edit", row);
    };

    return {
      allGroups,
      loading,
      totalNum,
      tableData,
      pageCount,
      currentPage,
      getAdminUsers,
      handleCurrentChange,
      childRef,
      add,
      del,
      view,
      edit,
    };
  },
};
</script>
<style></style>
