<script setup lang="ts">
import { useAppStore } from '@/store'

const appStore = useAppStore()
</script>

<template>
  <view class="container">
    <view class="flex flex-col justify-center items-center">
      <van-image
        :show-error="false"
        :show-loading="false"
        fit="contain"
        width="400rpx"
        height="400rpx"
        :src="appStore.noData"
      />
      <view class="text-[#6B6B6B] font-bold font-size-ten">暂无相关数据哦</view>
    </view>
  </view>
</template>
<style lang="less" scoped>
.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
