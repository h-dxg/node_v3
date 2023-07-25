<template lang="">
  <el-dialog width="30%" :title="data.title" v-model="data.dialogFormVisible">
    <el-row>
      <el-col :span="3">
        <el-button @click="search(data.form.id)">查询</el-button>
      </el-col>
      <el-col :span="21">
        <UserSelect isRow multiple v-model="data.value"></UserSelect>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="margin-top: 30px">
      <el-col :span="24">
        <el-tag
          v-for="tag in data.dataList"
          :key="tag.user_id"
          class="mx-1"
          closable
          :disable-transitions="false"
          @close="Close(tag.user_id)"
        >
          {{ tag.loginName }}
        </el-tag>
      </el-col>
    </el-row>

    <!-- <vxe-table
      v-if="data.dialogFormVisible"
      border
      :data="data.dataList"
      show-overflow
      ref="xTable"
      height="300px"
      :row-config="{ isHover: true }"
    >
      <vxe-column type="seq" width="50px"></vxe-column>
      <vxe-column field="loginName" width="180px" title="登录名"></vxe-column>
      <vxe-column field="user_name" width="180px" title="用户名"></vxe-column>
      <vxe-column title="操作" >
        <template #default="{ row }">
          <el-button
            link
            style="margin: 5px"
            @click.prevent="del(row)"
            type="primary"
            size="small"
            >删除</el-button
          >
        </template>
      </vxe-column>
    </vxe-table> -->
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
import { defineExpose, reactive, ref, watchEffect } from "vue";
import {
  roleUserAdd_Api,
  roleUpdate_Api,
  roleUsetList_Api,
  roleUsetDel_Api,
} from "@/api/sys/role";
import { menuList_Api } from "@/api/sys/menu";
export default {
  emits: ["getList"],
  setup(props, context) {
    const data = reactive({
      dialogFormVisible: false,
      loading: false,
      value: [],
      title: "",
      form: {
        id: "",
      },
      menuCheckedKeys: [],
      dataList: [],
    });
    let xTable = ref();
    watchEffect(async () => {
      if (data.value.length > 0) {
        // let ids = data.value.join(",");
        // data.form.userId = ids
        data.dataList = data.value;
        console.log("触发了", data.value);
      }
    });
    const Close = (id) => {
      data.dataList = data.dataList.filter((e) => e.user_id !== id);
    };
    const doSth = (titel, row) => {
      console.log(row, "row");
      data.title = titel;
      data.form.id = row.id;
      data.dialogFormVisible = true;
      search(row.id);
    };
    const search = async (id) => {
      console.log(id, "idddd");
      try {
        let res = await roleUsetList_Api({ id });
        console.log(data, "data");
        data.dataList = res.data.records;
      } catch (error) {
        console.log(error);
      }
    };
    const handleClose = () => {
      data.dialogFormVisible = false;
      data.menuCheckedKeys = [];
      data.value = [];
      data.form = {
        userId: "",
        id: "",
      };
    };

    const confirmEdit = async () => {
      try {
        data.loading = true;
        let ids = data.dataList
          .map((e) => {
            return e.user_id;
          })
          .join(",");
        let res = await roleUserAdd_Api({
          userid: ids,
          rid: data.form.id,
        });
        console.log(res, "res");
        data.loading = false;
        context.emit("getList");
        handleClose();
      } catch (e) {
        data.loading = false;
        console.error(e);
      }
    };
    const del = async (row) => {
      try {
        let res = await roleUsetDel_Api({ id: row.id });
        if (res) search(data.form.id);
      } catch (error) {
        console.log(error);
      }
    };
    defineExpose({ doSth });
    return {
      doSth,
      data,
      xTable,
      handleClose,
      confirmEdit,
      del,
      Close,
      search,
    };
  },
};
</script>
