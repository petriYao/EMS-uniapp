<script setup lang="ts">
import { getImageURL } from '@/utils'

const props = defineProps({
  img: {
    type: String,
    default: 'dataIsEmpty'
  },
  text: {
    type: String,
    default: '暂无相关数据哦'
  }
})
</script>

<template>
  <view class="flex-center">
    <view class="flex-column mt-200rpx">
      <u-image :show-loading="true" :src="getImageURL('empty', props.img)" width="80vw" />
      <view class="mt-200rpx text-#BFCEE0">{{ props.text }}</view>
    </view>
  </view>
</template>

<style lang="less" scoped></style>
