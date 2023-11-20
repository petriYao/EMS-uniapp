<script setup lang="ts">
import { AppSetInfoType } from '@/types/commonModel'
import { isEmpty } from 'lodash-es'
import { ref, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object as () => AppSetInfoType,
    default: {}
  }
})

const dataObj = ref({} as AppSetInfoType)
const htmlContent = ref()

watch(
  () => props.item,
  () => {
    if (props.item) {
      dataObj.value = props.item
      htmlContent.value = dataObj.value.content
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <view class="m-3" v-if="!isEmpty(dataObj)">
    <view class="">
      <u-image
        :show-loading="true"
        :src="dataObj.imageArray[0].listUrl"
        radius="20rpx"
        width="100%"
        height="300rpx"
      />
    </view>
    <div class="bg-white p-3">
      <view class="font-550 text_ellipsis">{{ dataObj.title }}</view>
      <view v-html="htmlContent" />
    </div>
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-image__image) {
  border-radius: 20rpx 20rpx 0 0 !important;
}
</style>
