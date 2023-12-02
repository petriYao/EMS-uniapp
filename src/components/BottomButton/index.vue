<script setup lang="ts">
const props = defineProps({
  background: {
    type: String,
    default: '#fff'
  }
})
</script>

<template>
  <view class="box" :style="{ background: props.background }">
    <slot></slot>
  </view>
</template>

<style lang="scss" scoped>
.box {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding-top: 20rpx;
  padding-bottom: 40rpx;
  z-index: 9;
}
</style>
