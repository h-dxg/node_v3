import { ref, onMounted } from "vue";
import { roleList_Api, roleDel_Api } from "@/api/sys/role";
import { ElMessage } from "element-plus";

export const useRoleList = () => {
  const pageCount = ref(10); // 每页10条数据
  const tableData = ref([]);
  const loading = ref(false);
  const totalNum = ref(0); // 分组内的用户总数
  const currentPage = ref(1); // 默认获取第一页的数据

  /**
   * 获取用户列表数据
   */
  const getAdminRoles = async () => {
    try {
      loading.value = true;
      let { data } = await roleList_Api({
        count: pageCount.value,
        page: currentPage.value,
      });

      loading.value = false;
      tableData.value = data.records;
      totalNum.value = data.total;
      console.log(totalNum.value, "  totalNum.value");
    } catch (e) {
      loading.value = false;
      console.error(e);
    }
  };

  /**
   * 删除接口
   */
  const deleteRow = async (row) => {
    try {
      loading.value = true;
      let { data } = await roleDel_Api({
        id: row.id,
      });
      ElMessage({
        message: data,
        type: "success",
      });
      loading.value = false;
      getAdminRoles();
    } catch (e) {
      loading.value = false;
      console.error(e);
    }
  };

  /**
   * 翻页
   */
  const handleCurrentChange = async (val) => {
    currentPage.value = val;
    await getAdminRoles();
  };

  onMounted(async () => {
    await getAdminRoles();
  });

  return {
    loading,
    totalNum,
    pageCount,
    tableData,
    currentPage,
    getAdminRoles,
    handleCurrentChange,
    deleteRow,
  };
};
