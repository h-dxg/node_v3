import { ref, onMounted } from "vue";
import { userList_Api, userDel_Api } from "@/api/sys/user";

export const useUserList = () => {
  const pageCount = ref(10); // 每页10条数据
  const tableData = ref([]);
  const loading = ref(false);
  const totalNum = ref(0); // 分组内的用户总数
  const currentPage = ref(1); // 默认获取第一页的数据

  /**
   * 获取用户列表数据
   */
  const getAdminUsers = async () => {
    try {
      loading.value = true;
      let { data } = await userList_Api({
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
      let { data } = await userDel_Api({
        user_id: row.user_id,
      });
      console.log(data, "data");
      loading.value = false;
      getAdminUsers();
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
    await getAdminUsers();
  };

  onMounted(async () => {
    await getAdminUsers();
  });

  return {
    loading,
    totalNum,
    pageCount,
    tableData,
    currentPage,
    getAdminUsers,
    handleCurrentChange,
    deleteRow,
  };
};
