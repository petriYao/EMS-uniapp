<script setup lang="ts">
import { useAppStore } from '@/store'

const appStore = useAppStore()

const props = defineProps({
  width: {
    type: String || Number,
    default: '400rpx'
  },
  height: {
    type: String || Number,
    default: '400rpx'
  },
  tip: {
    type: String,
    default: '暂无相关数据哦'
  }
})
</script>

<template>
  <view class="flex flex-col justify-center items-center">
    <van-image
      :show-error="false"
      :show-loading="false"
      fit="contain"
      :width="props.width"
      :height="props.height"
      :src="appStore.noData"
    />
    <view class="text-[#6B6B6B] font-bold font-size-ten text-center">{{ props.tip }}</view>
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
