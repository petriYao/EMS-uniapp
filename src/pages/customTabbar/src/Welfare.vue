<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

import { AppSetInfoApi } from '@/api'

import Content from './Content.vue'

// 轮播图
const current = ref(0) //当前所在滑块的 index
const swiperImgList = ref([] as string[]) //轮播图图片

const reactiveData = reactive({
  select: 'xiaobaoWelfare'
})

const getParkProfile = async () => {
  const res = await AppSetInfoApi('welfareCarouselImage')
  if (res.success && res.value) {
    swiperImgList.value = res.value?.imageArray?.map((item) => item.previewUrl) ?? []
  }
}

const selectClick = (type: string) => {
  reactiveData.select = type
}

onMounted(() => {
  getParkProfile()
})
</script>

<template>
  <ContentWrap>
    <Header :isLeftIcon="false" title="福利" />
    <!-- 头部结束 -->
    <view v-if="swiperImgList && swiperImgList.length > 0">
      <u-swiper
        :list="swiperImgList"
        :height="200"
        imgMode="aspectFill"
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

    <view class="flex justify-between mx-20rpx mt-20rpx">
      <view
        class="button-title"
        :class="reactiveData.select === 'xiaobaoWelfare' ? 'active' : ''"
        @click="selectClick('xiaobaoWelfare')"
        >小宝福利</view
      >
      <view
        class="button-title"
        :class="reactiveData.select === '1' ? 'active' : ''"
        @click="selectClick('1')"
        >线上特惠</view
      >
      <view
        class="button-title"
        :class="reactiveData.select === '2' ? 'active' : ''"
        @click="selectClick('2')"
        >包厢预约</view
      >
    </view>
    <view class="mx-20rpx">
      <Content :select="reactiveData.select" />
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 0 !important;
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

.button-title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
  width: 200rpx;
  border-radius: 80rpx;
  background: #fff;
  border: 1px solid #9d9d9d;
}

.active {
  color: #fff;
  border-color: linear-gradient(to right, #1957e6, #5670f3);
  background: linear-gradient(to right, #1957e6, #5670f3);
}

:deep(.u-swiper) {
  padding-bottom: 0 !important;
  background: #f6f7fb !important;
}

// :deep(.u-swiper__indicator) {
//   bottom: 30px;
// }

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
