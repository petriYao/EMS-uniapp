<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { useAppStore } from '@/store'
import { getImageURL, getSvgURL } from '@/utils'
import { AppSetInfoApi } from '@/api'
import router from '@/router'

const appStore = useAppStore()

// 轮播图
const current = ref(0)

const keyword = ref('')
const swiperImgList = ref([getImageURL('home', 'home-carousel1')])

const getHeadCarouselImage = async () => {
  const res = await AppSetInfoApi('headCarouselImage')
  if (res.success && res.value && res.value.imageArray) {
    swiperImgList.value = res.value.imageArray.map((item: any) => item.previewUrl)
  }
}

const onJump = (title: string) => {
  let src = ''
  switch (title) {
    case '园区简介':
      src = '/packageHome/introduction/index'
      break
    case '招商政策':
      src =
        '/packageHome/investmentPolicies/investmentPoliciesList?title=招商政策&name=investmentPolicies'
      break
    case '园区E闻':
      src = '/packageHome/parkENews/parkENewsList'
      break
    case '社群活动':
      src = '/packageHome/parkECircle/parkECircleList'
      break
    case '企业风采':
      src = '/packageHome/enterprisesDemeanour/index'
      break
    case '园区导览':
      src = '/packageHome/exhibition/index'
      break
    case '停车缴费':
      src = '/packageHome/parkingFee/index'
      break
    case '会议预定':
      src = '/packageHome/meetingBooking/index'
      break
    case '访客登记':
      src = '/packageHome/visitorRegistration/index'
      break
    case '报事报修':
      src = '/packageHome/reportRepairs/ReportRepairsList'
      break
    case '咨询建议':
      src = '/packageChat/consult/index?title=咨询建议'
      break
    case '智慧生活':
      appStore.bottomTabbarTitle = '服务'
      setTimeout(() => {
        uni.pageScrollTo({
          scrollTop: 99999,
          duration: 0
        })
      }, 100)
      return
    default:
      uni.showToast({
        title: '待开发',
        icon: 'success',
        mask: true
      })
      return
  }
  if (src.length > 0) {
    router.push({
      url: `${src}`
    })
  }
}
//扫二维码
const scanQRclick = () => {
  // #ifdef MP-WEIXIN
  uni.scanCode({
    success(res) {
      router.push({
        url: `/packageHome/parkingFee/FareInfo`
      })
      setTimeout(() => {
        uni.showToast({
          title: '扫码成功' + res.result,
          icon: 'none'
        })
      }, 300)
    },
    fail(err) {
      console.log(err)
      uni.showToast({
        title: '扫码失败',
        icon: 'none'
      })
    }
  })
  // #endif
  // #ifdef H5
  router.push({
    url: `/packageHome/parkingFee/FareInfo`
  })
  // #endif
}

onMounted(() => {
  getHeadCarouselImage()
})
</script>

<template>
  <ContentWrap>
    <!-- 轮播图 -->
    <scroll-view class="container">
      <view class="mb-20rpx">
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
      <view class="position-relative mx-30rpx my-20rpx bg-[#FFF] rounded-10rpx">
        <u-input
          placeholder="搜索您想要的"
          v-model="keyword"
          shape="square"
          :showAction="false"
          :searchIconSize="0"
        >
          <template #prefix>
            <view class="flex items-center">
              <u-icon name="scan" color="#0C0608" size="28" @click="scanQRclick" />
              <view class="bg-[#999999] h-[14px] w-1px mx-4px" />
            </view>
          </template>
        </u-input>
        <view
          class="position-absolute right-40rpx bottom-40rpx z-99"
          @click.stop="onJump('咨询建议')"
        >
          <u-image
            :src="appStore.keywordImage"
            width="87rpx"
            height="80rpx"
            :fade="false"
            :showLoading="false"
          />
          <!-- <u-icon :name="getSvgURL('home', 'home-keyword')" size="80rpx" /> -->
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
              <u-image
                :src="appStore.registerImage"
                width="127rpx"
                height="109rpx"
                :fade="false"
                :showLoading="false"
              />
              <!-- <u-icon :name="getSvgURL('home', 'home-register')" size="140rpx" /> -->
            </view>
          </view>
          <view
            class="square position-relative h-full flex flex-col justify-between"
            style="background: linear-gradient(348.98deg, #bbc9e4 0%, #aabcd4 100%)"
            @click="onJump('停车缴费')"
          >
            <view class="flex justify-end p-20rpx">
              <u-icon :name="getSvgURL('home', 'home-park')" size="48rpx" />
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
              <u-icon :name="getSvgURL('home', 'home-conference')" size="48rpx" />
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
              <view class="text-14rpx text-#eaebed mix-blend-soft-light"
                >REPORTING FOR REPAIRS</view
              >
            </view>
            <view class="h-[100%] flex items-center mr-[40rpx]">
              <u-image
                :src="appStore.repairsImage"
                width="121rpx"
                height="120rpx"
                :fade="false"
                :showLoading="false"
              />
              <!-- <u-icon :name="getSvgURL('home', 'home-repairs')" size="140rpx" /> -->
            </view>
          </view>
        </view>
        <view class="my-20rpx mx-30rpx flex-rows justify-between">
          <view
            class="rectangle flex flex-row justify-between h-full"
            style="background: linear-gradient(355.63deg, #48a3f4 0%, #2e63bf 100%)"
            @click="onJump('智慧生活')"
          >
            <view class="text-white p-20rpx">
              <view class="text-30rpx mb-6rpx">智慧生活</view>
              <view class="text-14rpx text-#eaebed mix-blend-soft-light">INTELLIGENT LIFE</view>
            </view>
            <view class="h-[100%] flex items-center mr-[40rpx]">
              <u-image
                :src="appStore.intelligentLifeImage"
                width="119rpx"
                height="129rpx"
                :fade="false"
                :showLoading="false"
              />
              <!-- <u-icon :name="getSvgURL('home', 'home-intelligent-life')" size="140rpx" /> -->
            </view>
          </view>
          <view
            class="square position-relative h-full flex flex-col justify-between"
            style="background: linear-gradient(348.98deg, #8473d3 0%, #624db2 100%)"
            @click="onJump('招商政策')"
          >
            <view class="flex justify-end p-20rpx">
              <u-icon :name="getSvgURL('home', 'home-attract-business')" size="48rpx" />
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
            @click="onJump('园区E闻')"
          >
            <view class="flex justify-end p-20rpx">
              <u-icon :name="getSvgURL('home', 'home-Ecircle')" size="48rpx" />
            </view>
            <view class="text-white p-20rpx">
              <view class="text-30rpx mb-6rpx">园区E闻</view>
              <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
            </view>
          </view>
          <view
            class="rectangle relative flex flex-row justify-between h-full"
            style="background: linear-gradient(355.63deg, #c9eaf1 0%, #83c4d8 100%)"
            @click="onJump('园区简介')"
          >
            <view class="text-white p-20rpx">
              <view class="text-30rpx mb-6rpx">园区简介</view>
              <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
            </view>
            <view class="absolute w-100%">
              <u-image
                height="180rpx"
                width="100%"
                radius="20rpx"
                :src="appStore.introductionImage"
                :fade="false"
                :showLoading="false"
              />
            </view>
          </view>
        </view>
        <view class="my-20rpx mx-30rpx flex-rows justify-between">
          <view
            class="w-335rpx h-180rpx rounded-20rpx flex flex-col justify-between"
            style="background: linear-gradient(353.74deg, #c8ebf1 0%, #82c5d8 100%)"
            @click="onJump('园区导览')"
          >
            <view class="flex justify-end p-20rpx">
              <u-icon :name="getSvgURL('home', 'home-exhibition')" size="48rpx" />
            </view>
            <view class="text-white p-20rpx">
              <view class="text-30rpx mb-6rpx">园区导览</view>
              <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS </view>
            </view>
          </view>
          <view
            class="w-335rpx h-180rpx rounded-20rpx"
            style="background: linear-gradient(353.74deg, #f28c7a 0%, #eb6059 100%)"
            @click="onJump('企业风采')"
          >
            <view class="flex justify-end p-20rpx">
              <u-icon :name="getSvgURL('home', 'home-presence')" size="48rpx" />
            </view>
            <view class="text-white p-20rpx">
              <view class="text-30rpx mb-6rpx mb-6rpx">企业风采</view>
              <view class="text-14rpx text-#eaebed mix-blend-soft-light">PARK NEWS</view>
            </view></view
          >
        </view>
      </view>
      <view class="w-full h-6vh" />
    </scroll-view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
:deep(.u-swiper) {
  padding-bottom: 0 !important;
  background: #f6f7fb !important;
}
.container {
  overscroll-behavior-x: auto; /* default */
  overscroll-behavior-x: contain;
  overscroll-behavior-x: none;
  -webkit-overflow-scrolling: touch;
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
