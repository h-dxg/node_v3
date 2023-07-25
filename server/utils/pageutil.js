/**
* 分页函数
* @author WANG
* @param {pageNum} String - 页码.
* @param {pageSize} String -当前页条数
*/
module.exports = function (pageNum = 1, pageSize = 10) {
  let skipIndex
  if (pageNum <= 0) {
    skipIndex = 1
  } else {
    skipIndex = (pageNum - 1) * pageSize
  }

  console.log('skio', skipIndex)
  return {
    pager: {
      pageSize,
      pageNum
    },
    skipIndex
  }
}