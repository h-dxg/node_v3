<template>
  <div>
    <el-input v-model="data.name" placeholder="请选择" :disabled="disabled" style="line-hight: 40px" :readonly="true"
      class="input-with-select">
      <template #append>
        <el-button :icon="Search" :disabled="disabled" @click="showUserSelect" />
      </template>
    </el-input>
    <user-select-dialog ref="userSelect"  :select-data="data.userList"  :limit="limit" @doSubmit="selectUsersToInput" />
    <!-- :limit="limit"
        :select-data="userList"
        @doSubmit="selectUsersToInput" -->
  </div>
</template>

<script>
// import SysUserApi from '@/platform/sys/api/SysUserApi'
import UserSelectDialog from "./UserSelectDialog";
import {  reactive, ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";
export default {
  name: "UserSelect",
  components: { UserSelectDialog },
  emits:['getValue'],
  props: {
    isRow: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, context) {
    console.log(props.modelValue,'value');
    const data = reactive({
      name: '',
      idKey: "user_id", // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      idName: "loginName", // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      userList: []
    });
    watch(() => props.modelValue, (newValue) => {
      console.log(newValue,'newValue');

    })
    let userSelect = ref();
    const showUserSelect = () => {
      userSelect.value.init();
    }
    const selectUsersToInput = (row) => {
      data.userList = row;
      let value = row.map((user) => {
        return user[data.idKey];
      });
      data.name = row.map((user) => {
        return user[data.idName];
      }).join(",");
      if (!props.multiple) {
        value = value[0];
      }
      if (props.isRow) {
         context.emit('update:modelValue', row)
      } else {
         context.emit('update:modelValue', value)
      }
     
    }
    // defineExpose({ doSth });
    return {
      data,
      Search,
      userSelect,
      showUserSelect,
      selectUsersToInput
    };
  },

  // data() {
  //   return {
  //     name: null,
  //     userList: [],
  //   };
  // },
  // computed: {
  //   limit() {
  //     if (this.multiple) {
  //       return 10;
  //     } else {
  //       return 1;
  //     }
  //   },
  // },
  // watch: {
  //   value(val) {
  //     if (val) {
  //       this.ref();
  //     } else {
  //       this.name = null;
  //       this.userList = [];
  //     }
  //   },
  // },
  // mounted: function () {
  //   if (this.value) {
  //     this.ref();
  //   }
  // },
  // methods: {

  //   selectUsersToInput(users) {
  //     this.userList = users;
  //     let value = users.map((user) => {
  //       return user.userid;
  //     });
  //     this.name = users
  //       .map((user) => {
  //         return user.nickname;
  //       })
  //       .join(",");
  //     if (!this.multiple) {
  //       value = value[0];
  //     }
  //     this.$emit("input", value);
  //     this.$emit("change", value);
  //   },
  //   ref() {
  //     SysUserApi.selectSysUser({ ids: this.value })
  //       .then((response) => {
  //         this.name = response
  //           .map((user) => {
  //             return user.nickname;
  //           })
  //           .join(",");
  //         this.userList = response;
  //       })
  //       .catch((error) => {
  //         console.log(error); // 请求失败返回的数据
  //       });
  //   },
  // },
};
</script>

<style scoped>
.input-with-select .el-input-group__prepend {
  background-color: #ccc;
}
</style>
