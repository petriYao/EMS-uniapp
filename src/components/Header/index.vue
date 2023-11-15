<script setup lang="ts">
import { useSlots } from 'vue'
import router from '../../router'

const props = defineProps({
  title: {
    //导航栏标题
    type: String,
    default: ''
  },
  bgColor: {
    //导航栏背景设置
    type: String,
    default: '#ffffff'
  },
  isLeftText: {
    //左边的提示文字
    type: Boolean,
    default: true
  },
  rightText: {
    //右边的提示文字
    type: String,
    default: ''
  },
  fixed: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: false
  }
})
const slots = useSlots() //检查是否有插槽

const onLeftClick = () => {
  router.back()
}
</script>

<template>
  <u-navbar
    :title="props.title"
    :fixed="props.fixed"
    :bgColor="props.bgColor"
    :placeholder="props.placeholder"
    :border="props.border"
    @leftClick="onLeftClick"
  >
    <template #left v-if="props.isLeftText">
      <slot name="left">
        <u-icon name="arrow-left" size="36rpx" />
      </slot>
    </template>
    <template #center v-if="slots.center">
      <slot name="center"></slot>
    </template>
    <template #right v-if="slots.right">
      <slot name="right"></slot>
    </template>
  </u-navbar>
</template>

<style lang="scss" scoped>
:deep(.u-navbar__placeholder) {
  padding-top: 55px !important;
}
:deep(.u-navbar__content__left) {
  padding: 55px 13px 0 13px;
}
:deep(.u-navbar__content) {
  padding-top: 55px !important;
}
</style>
