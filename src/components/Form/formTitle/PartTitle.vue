<script setup lang="ts">
import { PropType } from 'vue'

const props = defineProps({
  processTitle: {
    type: String as PropType<any>,
    default: '' as any
  }
})
</script>
<template>
  <view class="pl-20rpx bg-#f4f5f7 h-100rpx text-#196cff flex items-center font-semibold">
    <view class="mr-14rpx w-6rpx h-40rpx rounded-100px bg-#196cff" />
    <view>{{ props.processTitle }}</view>
  </view>
</template>
