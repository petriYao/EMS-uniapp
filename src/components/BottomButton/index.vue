<script setup lang="ts"></script>

<template>
  <view class="box">
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
  z-index: 99999;
}
</style>
