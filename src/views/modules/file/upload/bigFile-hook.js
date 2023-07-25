import { ref } from "vue";
import { FileList_Api, FileDel_Api } from "@/api/file/upload";

export const useList = () => {
  const pageCount = ref(10); // 每页10条数据
  const loading = ref(false);
  const totalNum = ref(0); // 分组内的用户总数
  const currentPage = ref(1); // 默认获取第一页的数据

  /**
   * 获取列表数据
   */
  const getList = async () => {
    try {
      loading.value = true;
      let { data } = await FileList_Api({
        count: pageCount.value,
        page: currentPage.value,
      });

      loading.value = false;
      totalNum.value = data.total;
      return data.records
    } catch (e) {
      loading.value = false;
      console.error(e);
    }
  };
  /**
   * 删除接口
   */
  const deleteRow = async (row, callback) => {
    try {
      loading.value = true;
      let { data } = await FileDel_Api({
        id: row.id,
        path: row.path
      });
      console.log(data, "data");
      loading.value = false;
      callback()
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
    await getList();
  };



  return {
    loading,
    totalNum,
    pageCount,
    currentPage,
    getList,
    handleCurrentChange,
    deleteRow,
  };
};
