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
  <view class="fixed w-100% h-100vh flex justify-center items-center flex-col">
    <u-image :show-loading="true" :src="getImageURL('empty', props.img)" width="80vw" />
    <view class="mt-200rpx text-#BFCEE0 text-[18px]">{{ props.text }}</view>
  </view>
</template>

<style lang="less" scoped></style>
