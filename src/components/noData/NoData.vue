<script setup lang="ts">
import { getImageURL } from '@/utils'
import { onBeforeMount, ref } from 'vue'

const props = defineProps({
  img: {
    type: String,
    default: 'dataIsEmpty'
  },
  text: {
    type: String,
    default: '暂无相关数据哦'
  },
  textTop: {
    type: String,
    default: '200rpx'
  },
  height: {
    type: String,
    default: '100vh'
  }
})
const isShow = ref(false)
onBeforeMount(() => {
  setTimeout(() => {
    isShow.value = true
  }, 500)
})
</script>

<template>
  <view
    class="fixed w-100% flex justify-center items-center flex-col"
    :style="{ height: props.height }"
    v-if="isShow"
  >
    <u-image :show-loading="true" :src="getImageURL('empty', props.img)" width="80vw" />
    <view class="text-#BFCEE0 text-[18px]" :style="{ marginTop: props.textTop }">{{
      props.text
    }}</view>
  </view>
</template>

<style lang="less" scoped></style>
