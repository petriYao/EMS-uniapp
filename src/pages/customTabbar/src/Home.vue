<script setup lang="ts">
import { AppSetInfoApi } from '@/api'
import router from '@/router'
import { getImageURL, getSvgURL } from '@/utils'
import { onMounted, ref } from 'vue'

// 轮播图
const current = ref(0)

const keyword = ref('')
const swiperImgList = ref([] as string[])
const uToastRef = ref()

const getHeadCarouselImage = async () => {
  const res = await AppSetInfoApi('headCarouselImage')
  if (res.success && res.value) {
    swiperImgList.value = res.value.imageArray.map((item: any) => item.listUrl)
  }
}

const onJump = (title: string) => {
  let src = ''
  switch (title) {
    case '园区简介':
      src = 'introduction/index'
      break
    case '招商政策':
      src = 'investmentPolicies/investmentPoliciesList'
      break
    case '园区E闻':
      src = 'parkENews/parkENewsList'
      break
    case '园区E圈':
      src = 'parkECircle/parkECircleList'
      break
    case '企业风采':
      src = 'enterprisesDemeanour/index'
      break
    case '园区展览':
      src = 'exhibition/index'
      break
    default:
      uToastRef.value.show({
        type: 'default',
        title: '默认主题',
        message: '待开发'
      })
      break
  }

  router.push({
    url: `/pages/${src}`
  })
}

onMounted(() => {
  getHeadCarouselImage()
})
</script>

<template>
  <ContentWrap>
    <!-- 标题栏 -->
    <!-- <Header title="首页" /> -->
    <!-- 轮播图 -->
    <view class="mb-20rpx" v-if="swiperImgList && swiperImgList.length > 0">
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
          <view class="indicator">
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
    <!-- 搜索框 -->
    <view class="position-relative px-30rpx py-20rpx bg-base">
      <u-search
        placeholder="搜索您想要的"
        v-model="keyword"
        shape="square"
        :showAction="false"
        :searchIconSize="0"
      />
      <view class="position-absolute right-60rpx bottom-40rpx">
        <u-icon :name="getSvgURL('home', 'home-keyword')" :size="50" />
      </view>
    </view>

    <view>
      <view class="my-20rpx mx-30rpx flex-rows justify-between">
        <view
          class="rectangle flex flex-row justify-between h-full"
          style="background: linear-gradient(355.63deg, #48a3f4 0%, #2e63bf 100%)"
          @click="onJump('访客登记')"
        >
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">访客登记</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">VISITOR REGISTRATION</view>
          </view>
          <view class="my-auto pr-40rpx">
            <u-icon :name="getSvgURL('home', 'home-register')" :size="70" />
          </view>
        </view>
        <view
          class="square position-relative h-full flex flex-col justify-between"
          style="background: linear-gradient(348.98deg, #bbc9e4 0%, #aabcd4 100%)"
          @click="onJump('停车缴费')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-park')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">停车缴费</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARKING PAYMENT</view>
          </view>
        </view>
      </view>
      <view class="my-20rpx mx-30rpx flex-rows justify-between">
        <view
          class="square position-relative h-full flex flex-col justify-between"
          style="background: linear-gradient(348.98deg, #f28c7a 0%, #eb6059 100%)"
          @click="onJump('会议预定')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-conference')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">会议预定</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">ADMISSION POLICY</view>
          </view>
        </view>
        <view
          class="rectangle flex flex-row justify-between h-full"
          style="background: linear-gradient(355.63deg, #c9eaf1 0%, #83c4d8 100%)"
          @click="onJump('报事报修')"
        >
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">报事报修</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">REPORTING FOR REPAIRS</view>
          </view>
          <view class="my-auto pr-40rpx">
            <u-icon :name="getSvgURL('home', 'home-repairs')" :size="70" />
          </view>
        </view>
      </view>
      <view class="my-20rpx mx-30rpx flex-rows justify-between">
        <view
          class="rectangle flex flex-row justify-between h-full position-relative"
          style="background: linear-gradient(355.63deg, #c9eaf1 0%, #83c4d8 100%)"
          @click="onJump('园区简介')"
        >
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">园区简介</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">ADMISSION POLICY</view>
          </view>
          <view class="position-absolute bottom-[-6rpx]">
            <!-- <up-image :show-loading="true" width="80px" height="80px" /> -->
            <img class="w-full rounded-20rpx" :src="getImageURL('home', 'home-introduction')" />
          </view>
        </view>
        <view
          class="square position-relative h-full flex flex-col justify-between"
          style="background: linear-gradient(348.98deg, #8473d3 0%, #624db2 100%)"
          @click="onJump('招商政策')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-attract-business')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">招商政策</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">ADMISSION POLICY</view>
          </view>
        </view>
      </view>
      <view class="my-20rpx mx-30rpx flex-rows justify-between">
        <view
          class="square h-full flex flex-col justify-between"
          style="background: linear-gradient(348.98deg, #93e7c6 0%, #57bc9c 100%)"
          @click="onJump('园区E圈')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-Ecircle')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">园区E圈</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
          </view>
        </view>
        <view
          class="rectangle flex flex-row justify-between h-full"
          style="background: linear-gradient(355.63deg, #48a3f4 0%, #2e63bf 100%)"
          @click="onJump('园区E闻')"
        >
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">园区E闻</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
          </view>
          <view class="my-auto pr-40rpx">
            <u-icon :name="getSvgURL('home', 'home-Esmell')" :size="70" />
          </view>
        </view>
      </view>
      <view class="my-20rpx mx-30rpx flex-rows justify-between">
        <view
          class="w-335rpx h-180rpx rounded-20rpx flex flex-col justify-between"
          style="background: linear-gradient(353.74deg, #c8ebf1 0%, #82c5d8 100%)"
          @click="onJump('园区展览')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-exhibition')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx">园区展览</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS </view>
          </view>
        </view>
        <view
          class="w-335rpx h-180rpx rounded-20rpx"
          style="background: linear-gradient(353.74deg, #f28c7a 0%, #eb6059 100%)"
          @click="onJump('企业风采')"
        >
          <view class="flex justify-end p-20rpx">
            <u-icon :name="getSvgURL('home', 'home-presence')" :size="24" />
          </view>
          <view class="text-white p-20rpx">
            <view class="text-30rpx mb-6rpx mb-6rpx">企业风采</view>
            <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
          </view></view
        >
      </view>
    </view>
    <u-toast ref="uToastRef" />
    <view class="w-full h-6vh" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 40rpx !important;
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
  padding: 2px 0;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 100px;
  width: 35px;
  @include flex;
  justify-content: center;

  &__text {
    color: #ffffff;
    font-size: 12px;
  }
}

:deep(.u-search__content) {
  background-color: #ffffff !important;
  padding: 10rpx 0;
  border-radius: 20rpx;
  padding-left: 20rpx;
}
:deep(.u-search__content__input) {
  background-color: #ffffff !important;
}

.rectangle {
  width: 480rpx;
  height: 180rpx;
  border-radius: 20rpx;
}
.square {
  width: 190rpx;
  height: 180rpx;
  border-radius: 20rpx;
}
</style>
