<script setup lang="ts">
import router from '@/router'
import { AppSetInfoType } from '@/types/commonModel'
import { isEmpty } from 'lodash-es'
import { ref, watch } from 'vue'

const props = defineProps({
  item: {
    type: Object as () => AppSetInfoType,
    default: {} as any
  },
  title: {
    type: String,
    default: ''
  }
})

const dataObj = ref({} as AppSetInfoType)
const htmlContent = ref()

const infoClick = () => {
  router.push({
    url: `/pages/listInfo/index?title=${props.title}&id=${dataObj.value.id}`
  })
}

watch(
  () => props.item,
  () => {
    if (props.item) {
      dataObj.value = props.item
      htmlContent.value = dataObj.value.content.replace(/<[^>]+>/g, '')
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
    <div class="bg-white p-3 rounded-20rpx" @click="infoClick">
      <view class="">
        <u-image
          :show-loading="true"
          :src="dataObj.imageArray?.[0].listUrl"
          radius="20rpx"
          width="100%"
          height="300rpx"
        />
      </view>
      <view class="font-semibold text-[16px] text-[#000000] mt-2 text_ellipsis">{{
        dataObj.title
      }}</view>
      <view class="text_ellipsis text-[#929CB5] my-2">
        {{ htmlContent }}
      </view>

      <view class="flex justify-between text-[#929CB5] text-[24rpx]">
        <view>{{ dataObj.createdUser }}</view>
        <view>{{ dataObj.createdAt }}</view>
      </view>
    </div>
  </view>
</template>

<style lang="scss" scoped>
// :deep(.u-image__image) {
//   border-radius: 20rpx 20rpx 0 0 !important;
// }
.text_ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
