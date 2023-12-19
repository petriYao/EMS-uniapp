<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { reactive, ref } from 'vue'
import { HouseInfo, HouseReservationUpdate } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import FormCustomDate from '@/components/Form/formItem/FormCustomDate.vue'

// 轮播图
const current = ref(0)
const reactiveData = reactive({
  houseReservationId: '',
  infoData: {} as any,
  setData: {
    houseId: '',
    reservationName: '',
    reservationPhone: '',
    reservationAt: '',
    reservationDes: ''
  } as any,
  swiperImgList: [],
  list: [
    {
      label: '预约姓名',
      value: 'reservationName',
      component: 'input',
      readonly: false,
      required: true
    },
    {
      label: '预约号码',
      value: 'reservationPhone',
      component: 'input',
      readonly: false,
      required: true
    },
    {
      label: '预约时间',
      value: 'reservationAt',
      component: 'customDate',
      readonly: false,
      required: true
    },
    { label: '预约留言', value: 'reservationDes', component: 'input', readonly: false }
  ]
})

const getData = async () => {
  const res = await HouseInfo(reactiveData.setData.houseId)
  if (res && res.success) {
    reactiveData.infoData = res.value
    reactiveData.swiperImgList = reactiveData.infoData.imageArray.map((item: any) => {
      return item.listUrl
    })
  }
}

const saveClick = async () => {
  const res = await HouseReservationUpdate(reactiveData.setData, reactiveData.houseReservationId)
  console.log('res', res)

  if (res && res.success) {
    uni.navigateBack()
  }
}

onLoad((val: any) => {
  reactiveData.setData.houseId = val.houseId
  getData()
})
</script>

<template>
  <ContentWrap>
    <view>
      <u-swiper
        :list="reactiveData.swiperImgList"
        :height="`500rpx`"
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
    <view
      class="bg-[#FFF] rounded-10rpx py-40rpx px-20rpx flex justify-between items-center mx-20rpx relative mt-[-40rpx]"
    >
      <view>
        <view class="text-32rpx font-bold">{{ reactiveData.infoData.houseName }}</view>
        <view class="mt-30rpx text-28rpx">{{ reactiveData.infoData.houseDes }}</view>
      </view>
      <view class="text-red">{{ reactiveData.infoData.housePrice }}</view>
    </view>
    <view>
      <view
        v-for="(item, index) in reactiveData.list"
        :key="index"
        class="flex items-center bg-[#FFF] mt-20rpx px-20rpx py-10rpx text-[28rpx]"
      >
        <view class="w-160rpx">
          {{ item.label }}<text v-if="item.required" class="text-red">*</text>
        </view>
        <view class="flex-1">
          <view v-if="item.component === 'input'">
            <u-input
              :placeholder="`请输入${item.label}`"
              border="surround"
              inputAlign="right"
              :readonly="item.readonly"
              v-model="reactiveData.setData[item.value]"
            />
          </view>
          <view
            v-else-if="item.component === 'customDate'"
            class="h-36px flex items-center justify-end"
          >
            <FormCustomDate
              v-model="reactiveData.setData[item.value]"
              placeholder="请选择预约时间"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="h-120rpx" />
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx z-999">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click="saveClick"
      >
        预约看房
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
::v-deep .form-custom-date {
  justify-content: flex-end;
}

::v-deep .u-swiper__indicator {
  bottom: 60rpx;
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
</style>
