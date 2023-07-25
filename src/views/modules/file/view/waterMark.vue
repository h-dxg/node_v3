<template lang="">
  <div id="mark" ref="addmark">
    <slot></slot>
    <!-- 添加一个div 填充区域设置水印重复 -->
  </div>
</template>
<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue";
import { defineProps } from "vue";
const props = defineProps({
  fontSize: String,
  text: String,
  src: String,
  clientWidth: String,
  clientHeight: String
});
let addmark = ref("");
let flag= ref(true);
/**
 * 获取水印模型
 * @author WANG
 */
let useMark = computed(() => {
  const canvas = document.createElement("canvas");
  console.log(canvas, "canvas");
  const devicePixelRatio = window.devicePixelRatio || 1; //页面放大倍率
  const fontSize_ = props.fontSize * devicePixelRatio;
  const font = fontSize_ + "px 楷体";
  const ctx = canvas.getContext("2d"); /* 创建 context 对象 */
  const { width } = ctx.measureText(props.text); //测量文字宽度
  const canvansSize = Math.max(100, width) * devicePixelRatio;
  canvas.width = canvansSize;
  canvas.height = canvansSize;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((30 * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.font = font;
  ctx.fillText(props.text, 0, 0);
  return {
    base64: canvas.toDataURL(),
    size: canvansSize,
  };
});
let getImg = () => {
  // 合成图片canvas
  const canvas = document.createElement("canvas");
  var imgbase64 = props.src;
  let img = new Image();
  img.src = imgbase64;
  let myCanvas = canvas.getContext("2d");
  canvas.width = props.clientWidth;
  canvas.height = 500
  img.onload = () => {
    myCanvas.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
  addmark.value.appendChild(canvas);
};
let o //dom监听实例
let div //存放dom水印

onMounted(() => {
  // 原生api监听dom变化
  o = new MutationObserver((res) => {
    console.log(res, 'res111')//删除dom回调函数数组列表
    for (let item of res) {
      // 删除的节点，判断是否删除水印div
      for (let i of item.removedNodes) {
        if (i === div) {
          console.log('删除水印');
          flag.value=!flag.value
        }
        // 修改样式
        if (res.target === div) {
          console.log('修改水印');
          flag.value=!flag.value
        }
      }
    }
  })
  o.observe(addmark.value, {
    // 配置项目，监听项
    childList: true,//元素内容
    attributes: true ,//本身属性
    subtree: true ,//子节点树
  })
})
onUnmounted(() => {
  o.disconnect() //取消
  div=null
})
watchEffect(() => {
  flag.value //触发监听依赖重新执行
  // 监听是否挂载完成 防止dom篡改
  if (!addmark.value) {
    return;
  }
  if(div) div.remove()
  div = document.createElement("div");
  const { base64, size } = useMark.value;
  getImg()
  div.style.backgroundImage = `url(${base64})`;
  div.style.backgroundSize = `${size}px ${size}px`;
  div.style.backgroundRepeat = "repeat";
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.zIndex = "9999";
  div.style.position = "absolute";
  div.style.inset = 0; // 子元素填充满

  // console.log(div, "div");
  addmark.value.appendChild(div);
});
</script>
<style scoped>
#mark {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
