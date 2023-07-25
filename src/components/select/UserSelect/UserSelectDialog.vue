<template>
  <el-dialog title="用户选择" width="35%" v-model="visible" :before-close="handleClose">
    <div class="el-header">
      <template v-if="dataListSelections.length > 0">
        <el-tag
          v-for="(i, index) in dataListSelections"
          :key="index"
          closable
          @close="closeTag(index)"
          >{{ i[idName] }}</el-tag
        >
      </template>
    </div>
    <div
      style="
        width: 100%;
        padding: 5px;
        border: 1px solid #d3d3d3;
        margin-bottom: 5px;
        margin-top: 5px;
        box-sizing: border-box;
      "
    >
      <el-input
        v-model="searchForm.name"
        placeholder="搜索"
        :disabled="disabled"
        class="input-with-select"
      >
        <template #append>
          <el-button :icon="Search" :disabled="disabled" @click="getAdminUsers" />
        </template>
      </el-input>
    </div>
    <el-container :style="{ height: logHeight - 200 + 'px' }">
      <el-container>
        <ul
          v-infinite-scroll="load"
          :infinite-scroll-immediate="false"
          :infinite-scroll-delay="1000"
          style="border: 1px dotted #d3d3d3; overflow: auto"
          class="infinite-list"
        >
          <el-radio-group v-if="limit < 2" v-model="radio" style="width: 100%">
            <li
              v-for="(i, index) in tableData"
              :key="index"
              @click.stop="clickRow({ [idKey]: i[idKey], [idName]: i[idName] })"
            >
              <el-radio :label="i[idKey]">{{ i[idName] }} </el-radio>
            </li>
          </el-radio-group>
          <el-checkbox-group v-else v-model="checkList">
            <li
              v-for="(i, index) in tableData"
              :key="index"
              @click.stop="clickRow({ [idKey]: i[idKey], [idName]: i[idName] })"
            >
              <el-checkbox style="width: 100%; height: 100%" :label="i[idKey]">{{
                i[idName]
              }}</el-checkbox>
            </li>
          </el-checkbox-group>
        </ul>
      </el-container>
    </el-container>
    <template #footer>
      <div class="dialog-footer">
        <el-button size="mini" type="primary" @click="doSubmit()">确定</el-button>
        <el-button size="mini" @click="close()">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import {
  defineExpose,
  toRefs,
  reactive,
  nextTick,
  watchEffect,
} from "vue";
import { Search } from "@element-plus/icons-vue";
import { useUserList } from "@/views/modules/sys/user/user-hook";
export default {
  name: "UserSelectDialog",
  props: {
    limit: {
      type: Number,
      default: 12,
    },
    selectData: {
      type: Array,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: [],
    },
  },
  emits: ["doSubmit"],
  setup(props,context) {
    const data = reactive({
      radio: "", // 单选绑定字段
      checkList: [], // 多选绑定字段
      logHeight: 600,
      searchForm: {
        roleList: "",
        loginName: "",
        name: "",
      },
      filterText: "",
      dataListAllSelections: [], // 所有选中的数据包含跨页数据
      dataListSelections: [],
      idKey: "user_id", // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      idName: "loginName", // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      temp: [],
      loading: false,
      visible: false,
    });
    // eslint-disable-next-line vue/no-setup-props-destructure
    const { limit } = props;
    const { getAdminUsers, tableData } = useUserList();
    const init = (selectData) => {
      data.visible = true;
      getAdminUsers();
      data.temp = [];
      if (selectData) {
        data.dataListAllSelections = JSON.parse(JSON.stringify(selectData));
      }
      nextTick(() => {
        setSelectRow()
      })
    };
    const load = async () => {
      getAdminUsers();
      console.log(tableData, "tableData");
    };
    //   点击选中
    const clickRow = (val) => {
      if (limit > 1) {
        // 多选
        data.temp.push(val);
      } else {
        // 单选
        data.radio = val[data.idKey];
        getTemplateRow(null, val);
      }
    };
    watchEffect(() => {
      //默认是立即监听，当使用的数据改变时，就会触发。可以用于关联数据改变回调方法等场景
      data.dataListSelections = data.checkList;
      const obj = {};
      let idKey = data.idKey;
      let idName = data.idName;
      // 去重
      const res = data.temp.reduce(function (preValue, item) {
        obj[item[idKey]] ? "" : (obj[item[idKey]] = true && preValue.push(item));
        return preValue;
      }, []);
      const arr = [];
      data.dataListSelections.forEach((e) => {
        res.forEach((j) => {
          if (e === j[idKey]) {
            arr.push({ [idKey]: j[idKey], [idName]: j[idName] });
          }
        });
      });
      data.dataListSelections = arr;
      nextTick(() => {
        changePageCoreRecordData();
      });
    });
    const getTemplateRow = (index, row) => {
      data.dataListSelections = [row];
      changePageCoreRecordData();
    };
    const doSubmit = () => {
      if (limit < data.dataListAllSelections.length) {
        this.$message.error(`你最多只能选择${this.limit}个用户`);
        return;
      }
      data.visible = false;
      context.emit("doSubmit", data.dataListAllSelections);
    };
    const close = () => {
      data.visible = false;
      data.dataListAllSelections= []
      data.dataListSelections=[]
    }
    //   // 记忆选择核心方法
    const changePageCoreRecordData = () => {
      // 标识当前行的唯一键的名称
      const idKey = data.idKey;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (data.dataListAllSelections.length <= 0) {
        data.dataListSelections.forEach((row) => {
          data.dataListAllSelections.push(row);
        });
        return;
      }
      // 总选择里面的key集合
      const selectAllIds = [];
      data.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      const selectIds = [];
      // 获取当前页选中的id
      data.dataListSelections.forEach((row) => {
        selectIds.push(row[idKey]);
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          data.dataListAllSelections.push(row);
        }
      });
      const noSelectIds = [];
      let arr = [...tableData.value];
      // 得到当前页没有选中的id
      arr.forEach((row) => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey]);
        }
      });
      noSelectIds.forEach((id) => {
        if (selectAllIds.indexOf(id) >= 0) {
          for (let i = 0; i < data.dataListAllSelections.length; i++) {
            if (data.dataListAllSelections[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              data.dataListAllSelections.splice(i, 1);
              break;
            }
          }
        }
      });
    };
    const closeTag = (index) => {
      if (limit > 1) {
        // 多选
      } else {
        // 单选
        data.radio = "";
      }
      data.dataListSelections.splice(data.dataListSelections.indexOf(index), 1);
      nextTick(() => {
        setSelectRow();
      });
    };
    //设置选中的方法
    const setSelectRow = () => {
      if (!data.dataListAllSelections || data.dataListAllSelections.length <= 0) {
        // this.$refs.userTable.clearSelection()
        return;
      }
      // 标识当前行的唯一键的名称
      const idKey = data.idKey;
      const selectAllIds = [];
      data.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      let arr = [...tableData.value];
      // this.$refs.userTable.clearSelection()
      for (var i = 0; i < arr.length; i++) {
        if (selectAllIds.indexOf(arr[i][idKey]) >= 0) {
          // 设置选中，记住table组件需要使用ref="table"
          // this.$refs.userTable.toggleRowSelection(this.dataList[i], true)
        }
      }
    };
    defineExpose({ init });
    return {
      ...toRefs(data),
      init,
      load,
      tableData,
      Search,
      getAdminUsers,
      clickRow,
      closeTag,
      doSubmit,
      close
    };
  }
};
</script>
<style lang="scss" scoped>
.el-main {
  padding: 5px 0px 20px 0px;
}

.el-header {
  padding: 5px;
  height: 40px;
  border: 1px dotted #d3d3d3;
  width: 100%;
}

ul {
  margin: 0;
  padding: 0;
  width: 100%;
}

li {
  padding: 0 20px 0 20px;
  box-sizing: border-box;
  height: 30px;
  // line-height: 30px;
  vertical-align: middle;
  width: 100%;
  list-style: none;
  cursor: pointer;
}

li:hover {
  background-color: #eff4f9;
}

.el-icon-circle-close {
  display: none !important;
}
</style>
