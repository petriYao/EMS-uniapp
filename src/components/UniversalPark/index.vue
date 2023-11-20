<script setup lang="ts">
import { AppSetInfoType } from '@/types/commonModel'
import { isEmpty } from 'lodash-es'
import { ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object as () => AppSetInfoType,
    default: {}
  }
})
// 轮播图
const current = ref(0) //当前所在滑块的 index
const swiperImgList = ref([] as string[]) //轮播图图片
const htmlContent = ref()

watch(
  () => props.data,
  () => {
    if (!isEmpty(props.data)) {
      swiperImgList.value = props.data.imageArray.map((item) => item.listUrl)
      htmlContent.value = props.data.content
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <view v-if="swiperImgList && swiperImgList.length > 0">
    <u-swiper
      :list="swiperImgList"
      :height="`580rpx`"
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

  <view class="p-3 mx-3 bg-white rounded-lg" v-if="props.data.title">
    <view class="text-36rpx font-550 pb-4">{{ props.data.title }}</view>
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
