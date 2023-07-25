<template>
     <!-- <svg class="iconSvg" :class="svgClass">
          <title>{{ title }}</title>
          <use :xlink:href="iconName"></use>
      </svg> -->
  <i :class="['svg-icon', `svg-icon-${iconClass}`, className]" :style="svgStyle">
    <svg >
      <use :xlink:href="iconName" />
    </svg>
  </i>
</template>
<script>
export default {
  name: "SvgIcon",
  props: {
    iconClass: {
      type: String,
      required: true
    },
    className: {
      type: String
    },
    color: {
      type: String
    },
    size: {
      type: Number
    }
  },
  computed: {
    iconName () {
      return `#icon-${this.iconClass}`;
    },
    svgClass () {
      if (this.className) {
        return `${this.className}`;
      }
      return "";
    },
    svgStyle () {
      const { color, size } = this;
      const style = {};
      color && (style.color = color);
      size && (style.fontSize = `${size}px`);
      return style;
    }
  }
};
</script>
<style scoped>
/* .svg-icon {
  vertical-align: -0.125em;
  line-height: 0;
  display: inline-block;
} */
.iconSvg {
    cursor: pointer;
    width: 100%;
    height: 100%;
}
</style>
