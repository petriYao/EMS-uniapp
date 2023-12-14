<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from 'vue'

import { isEmpty } from '@/utils'
import { AppSetInfoType } from '@/types/commonModel'
import router from '@/router'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  item: {
    type: Object as () => AppSetInfoType,
    default: {} as any
  }
})

const instance = getCurrentInstance()

const dataObj = ref({} as AppSetInfoType)
const htmlContent = ref()

const infoClick = () => {
  if (dataObj.value.jumpUrl && dataObj.value.jumpUrl.length > 0) {
    router.push({
      url: `/packageHome/listInfo/JumpUrl?title=${props.title}&id=${dataObj.value.id}`
    })
  } else {
    router.push({
      url: `/packageHome/listInfo/index?title=${props.title}&id=${dataObj.value.id}`
    })
  }
}

const maxHeight = uni.upx2px(90)

const setContent = () => {
  uni
    .createSelectorQuery()
    .in(instance)
    .select('#titleID')
    .boundingClientRect(function (rect: any) {
      if (rect?.height > maxHeight) {
        htmlContent.value = ''
      }
    })
    .exec()
}

watch(
  () => props.item,
  () => {
    if (props.item) {
      dataObj.value = props.item
      if (dataObj.value.content) htmlContent.value = dataObj.value.content.replace(/<[^>]+>/g, '')
    }
  },
  {
    immediate: true,
    deep: true
  }
)

onMounted(() => {})

defineExpose({ setContent })
</script>

<template>
  <view class="my-2 w-[100%] text-[#929CB5] text-[24rpx] flex justify-center">
    {{ dataObj.createdAt }}
  </view>

  <view class="mx-3 my-1.5" v-if="!isEmpty(dataObj)" @tap="infoClick">
    <view class="bg-white rounded-20rpx" v-if="dataObj.listType === 0">
      <view class="image-title">
        <u-image
          :show-loading="false"
          :src="dataObj.imageArray?.[0].listUrl"
          radius="8px 8px 0 0"
          width="100%"
          height="300rpx"
        />
        <!-- <img :src="dataObj.imageArray?.[0].listUrl" class="w-[100%] h-[300rpx]" /> -->
      </view>
      <view class="p-3 pt-2">
        <view class="font-semibold text-[16px] text-[#000000] title_ellipsis">
          {{ dataObj.title }}
        </view>
        <view class="content_ellipsis text-[#929CB5] mt-2" v-if="htmlContent">
          {{ htmlContent }}
        </view>

        <view
          class="flex justify-between text-[#929CB5] mt-2 text-[24rpx]"
          v-if="dataObj.publishOrigin"
        >
          {{ dataObj.publishOrigin }}
        </view>
      </view>
    </view>
    <view class="bg-white p-3 rounded-20rpx flex justify-between" v-if="dataObj.listType === 1">
      <view class="flex-col flex justify-between flex-1">
        <view>
          <view id="titleID" class="font-semibold text-[16px] text-[#000000] title_ellipsis">
            {{ dataObj.title }}
          </view>
          <view class="content_ellipsis text-[#929CB5] mt-2">
            {{ htmlContent }}
          </view>
        </view>
        <view class="flex justify-between text-[#929CB5] mt-2 text-[24rpx]">
          {{ dataObj.publishOrigin }}
        </view>
      </view>
      <view class="ml-20rpx">
        <u-image
          :show-loading="false"
          :src="dataObj.imageArray?.[0].listUrl"
          radius="20rpx"
          width="200rpx"
          height="200rpx"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// :deep(.u-image__image) {
//   border-radius: 20rpx 20rpx 0 0 !important;
// }
.image-title {
  border-radius: 8px 8px 0 0;
}
.title_ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 设置显示的行数 */
  -webkit-box-orient: vertical;
}
.content_ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
