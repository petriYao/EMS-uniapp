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
  isLeftIcon: {
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
    :fixed="props.fixed"
    :bgColor="props.bgColor"
    :placeholder="props.placeholder"
    :border="props.border"
    :leftIconSize="0"
    @leftClick="onLeftClick"
  >
    <template #left>
      <slot name="left">
        <u-icon name="arrow-left" size="36rpx" v-if="props.isLeftIcon" />
      </slot>
    </template>
    <template #center>
      <slot name="center">
        <view v-if="props.title">{{ props.title }}</view>
      </slot>
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
