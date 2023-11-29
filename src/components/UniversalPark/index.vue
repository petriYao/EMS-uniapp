<script setup lang="ts">
import { useAppStore } from '@/store'
import { AppSetInfoType } from '@/types/commonModel'
import { isEmpty } from 'lodash-es'
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object as () => AppSetInfoType,
    default: {} as any
  }
})

const appStore = useAppStore()

// 轮播图
const current = ref(0) //当前所在滑块的 index
const swiperImgList = ref([] as string[]) //轮播图图片
const htmlContent = ref('')
const productHeight = ref()

const getImageHeight = (imageItem: any) => {
  if (imageItem.imageDim) {
    return (imageItem.imageDim.height / imageItem.imageDim.width) * appStore.screenWidth
  }
  return ''
}

watch(
  () => props.data,
  () => {
    if (!isEmpty(props.data)) {
      htmlContent.value = props.data.content ?? ''
      swiperImgList.value = props.data?.imageArray?.map((item) => item.previewUrl) ?? []

      //图片显示高度
      const min = uni.upx2px(300)
      const max = (appStore.screenWidth * 4) / 3
      const screenWidth = appStore.screenWidth
      let height = min
      for (const item of props.data?.imageArray ?? []) {
        if (item.imageDim) {
          const temp = (item.imageDim.height / item.imageDim.width) * screenWidth
          if (temp > height) {
            height = temp
          }
        }
      }
      if (height > max) height = max
      productHeight.value = height
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <view v-if="swiperImgList && swiperImgList.length > 1">
    <u-swiper
      :list="swiperImgList"
      :height="productHeight"
      imgMode="heightFix"
      :autoplay="true"
      indicatorActiveColor="#9D9D9D"
      indicatorInactiveColor="#CACACA"
      @change="(e:any) => (current = e.current)"
    >
      <template #indicator>
        <view class="indicator" v-if="swiperImgList.length > 1">
          <view
            class="indicator__dot"
            v-for="(_item, index) in swiperImgList"
            :key="index"
            :class="[index === current && 'indicator__dot--active']"
          />
        </view>
      </template>
    </u-swiper>
  </view>

  <view v-else-if="swiperImgList && swiperImgList.length === 1">
    <u-image
      width="100%"
      mode="widthFix"
      :height="getImageHeight(props.data?.imageArray[0])"
      :src="swiperImgList[0]"
      :show-loading="true"
    />
  </view>

  <view
    class="p-3 mx-3 mt-3 bg-white rdouned-lg"
    v-if="(props.data?.title && props.data?.title?.length > 0) || htmlContent.length > 0"
  >
    <view class="text-36rpx font-550 pb-4">{{ props.data?.title }}</view>
    <!-- eslint-disable vue/no-v-text-v-html-on-component -->
    <!-- eslint-disable vue/no-v-html -->
    <view v-html="htmlContent" />
  </view>
  <view class="w-full h-[200rpx]" />
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 40rpx;
  background: #f6f7fb !important;
}

.indicator {
  @include flex(row);
  justify-content: center;

  &__dot {
    height: 8rpx;
    width: 8rpx;
    border-radius: 100px;
    background-color: #cacaca;
    margin: 0 8rpx;
    transition: background-color 0.3s;

    &--active {
      width: 40rpx;
      height: 8rpx;
      background-color: #9d9d9d;
    }
  }
}
.indicator-num {
  padding: 4rpx 0;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 200rpx;
  width: 70rpx;
  @include flex;
  justify-content: center;

  &__text {
    color: #ffffff;
    font-size: 24rpx;
  }
}
</style>
