import { ref, onMounted } from "vue";
import { menuList_Api, menuDel_Api } from "@/api/sys/menu";

export const useMenuList = () => {
  const pageCount = ref(10); // 每页10条数据
  const tableData = ref([]);
  const loading = ref(false);
  const totalNum = ref(0); // 分组内的用户总数
  const currentPage = ref(1); // 默认获取第一页的数据

  /**
   * 获取用户列表数据
   */
  const getMenus = async () => {
    try {
      loading.value = true;
      let { data } = await menuList_Api({});
      loading.value = false;
      tableData.value = data.records;
      tableData.value.shift();
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
      let { data } = await menuDel_Api({
        id: row.id,
      });
      loading.value = false;
      getMenus();
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
    await getMenus();
  };

  onMounted(async () => {
    await getMenus();
  });

  return {
    loading,
    totalNum,
    pageCount,
    tableData,
    currentPage,
    getMenus,
    handleCurrentChange,
    deleteRow,
  };
};
