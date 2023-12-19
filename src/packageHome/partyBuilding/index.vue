<script setup lang="ts">
import { AppSetInfoApi } from '@/api'
import router from '@/router'
import { getSvgURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'

// 轮播图
const reactiveData = reactive({
  swiperImgList: [] as string[],
  actionList: [
    {
      title: '党务公开',
      value: 'partyOpen',
      icon: 'partyWork'
    },
    {
      title: '学习中心',
      value: 'partyStudy',
      icon: 'study'
    }
  ]
})

// 轮播图
const current = ref(0)

const getParkProfile = async () => {
  const res = await AppSetInfoApi('partyCarouselImage')
  console.log('res', res)
  if (res.success && res.value) {
    reactiveData.swiperImgList = res.value.imageArray.map((item: any) => {
      return item.listUrl
    })
  }
}

const infoClick = (item: any) => {
  router.push({
    url: `/packageHome/investmentPolicies/investmentPoliciesList?title=${item.title}&name=${item.value}`
  })
}

onLoad(async () => {
  getParkProfile()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="智慧党建" />
    <!-- 头部结束 -->
    <view>
      <u-swiper
        :list="reactiveData.swiperImgList"
        :height="`400rpx`"
        imgMode="heightFix"
        :autoplay="true"
        indicatorActiveColor="#9D9D9D"
        indicatorInactiveColor="#CACACA"
        @change="(e:any) => (current = e.current)"
      >
        <template #indicator>
          <view class="indicator">
            <view
              class="indicator__dot"
              v-for="(_item, index) in reactiveData.swiperImgList"
              :key="index"
              :class="[index === current && 'indicator__dot--active']"
            />
          </view>
        </template>
      </u-swiper>
    </view>
    <view class="flex flex-wrap mt-20rpx bg-#FFF pt-20rpx">
      <view
        v-for="(item, index) of reactiveData.actionList"
        :key="index"
        class="w-25% flex flex-col items-center justify-center pb-20rpx"
        @click="infoClick(item)"
      >
        <view>
          <u-icon :name="getSvgURL('partyCarouse', item.icon)" color="#9D9D9D" size="60rpx" />
        </view>
        <view class="mt-16rpx text-26rpx">{{ item.title }}</view>
      </view>
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
</style>
