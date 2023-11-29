<script setup lang="ts">
import router from '@/router'
import { AppSetInfoType } from '@/types/commonModel'
import { isEmpty } from 'lodash-es'
import { getCurrentInstance, onMounted, ref, watch } from 'vue'

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
  if (!dataObj.value.jumpUrl) {
    router.push({
      url: `/pages/listInfo/index?title=${props.title}&id=${dataObj.value.id}`
    })
  } else {
    router.push({
      url: `/pages/listInfo/JumpUrl?id=${dataObj.value.id}&title=${dataObj.value.title}`
    })
    // window.location.href = dataObj.value.jumpUrl!
  }
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

onMounted(() => {
  setTimeout(() => {
    getDATa()
  }, 200)
})

const instance = getCurrentInstance()
const getDATa = () => {
  uni
    .createSelectorQuery()
    .in(instance)
    .select('#titleID')
    .boundingClientRect(function (rect: any) {
      console.log('titleID', rect)
      if (rect.height > 60) {
        htmlContent.value = ''
      }
    })
    .exec()
}
</script>

<template>
  <view class="my-2 w-[100%] text-[#929CB5] text-[24rpx] flex justify-center">
    {{ dataObj.createdAt }}
  </view>

  <view class="mx-3 my-1.5" v-if="!isEmpty(dataObj)" @click="infoClick">
    <div class="bg-white rounded-20rpx" v-if="dataObj.listType === 0">
      <view class="image-title">
        <u-image
          :show-loading="true"
          :src="dataObj.imageArray?.[0].listUrl"
          radius="8px 8px 0 0"
          width="100%"
          height="300rpx"
        />
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
    </div>
    <div class="bg-white p-3 rounded-20rpx flex justify-between" v-if="dataObj.listType === 1">
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
          :show-loading="true"
          :src="dataObj.imageArray?.[0].listUrl"
          radius="20rpx"
          width="200rpx"
          height="200rpx"
        />
      </view>
    </div>
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
  -webkit-line-clamp: 3; /* 设置显示的行数 */
  -webkit-box-orient: vertical;
}
.content_ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  white-space: pre-wrap;
}
</style>
