<script setup lang="ts">
import { ref, useSlots } from 'vue'
import router from '../../router'
import { useAppStore } from '@/store'

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
const appStore = useAppStore()

const classHeight = ref<string | null>(appStore.menuTop + 'px')
if (appStore.deviceType == 'ios') {
  classHeight.value = null
}

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
    @left-click="onLeftClick"
  >
    <template #left>
      <slot name="left">
        <view>
          <u-icon name="arrow-left" size="36rpx" v-if="props.isLeftIcon" />
        </view>
      </slot>
    </template>
    <template #center>
      <slot name="center">
        <view>
          <view>{{ props.title }}</view>
        </view>
      </slot>
    </template>
    <template #right v-if="slots.right">
      <slot name="right"></slot>
    </template>
  </u-navbar>
</template>

<style lang="scss" scoped>
:deep(.u-navbar__placeholder) {
  padding-top: v-bind(classHeight);
}
:deep(.u-navbar__content__left) {
  padding-top: v-bind(classHeight);
}
:deep(.u-navbar__content) {
  padding-top: v-bind(classHeight);
}
</style>
