<script setup lang="ts">
import router from '@/router'
import { getSvgURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const reactiveData = reactive({
  manageList: [
    { label: '车牌管理', img: 'license-plate' },
    { label: '停车记录', img: 'parking-record' },
    { label: '月卡管理', img: 'monthly-card' },
    { label: '电子发票', img: 'electronic-invoice' }
  ],
  newData: new Date().toLocaleString(),
  carInfoList: [
    {
      carNumber: '闽A·860R088',
      enterTime: new Date().toLocaleString(),
      enterDuration: '3小时30分钟',
      type: ''
    },
    {
      carNumber: '闽A·860R088',
      enterTime: new Date().toLocaleString(),
      enterDuration: '3小时30分钟',
      type: '月卡生效中'
    },
    {
      carNumber: '闽A·860R088',
      enterTime: new Date().toLocaleString(),
      enterDuration: '3小时30分钟',
      type: 'VIP生效中'
    }
  ]
})
//去缴费
const payTheBillClick = () => {
  console.log('点击')
  router.push({
    url: `/packageHome/parkingFee/FareInfo`
  })
}

const selectClick = (type: string) => {
  switch (type) {
    case '车牌管理':
      router.push({
        url: `/packageHome/parkingFee/CarNumberManage`
      })
      break
    case '停车记录':
      router.push({
        url: `/packageHome/parkingFee/PaymentRecords`
      })
      break
  }
}
onLoad(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="停车缴费" />
    <!-- 头部结束 -->
    <view class="m-20rpx">
      <!-- 头部管理列表 -->
      <view class="flex px-20rpx py-30rpx bg-[#FFF]">
        <view
          v-for="(item, index) in reactiveData.manageList"
          :key="index"
          @click="selectClick(item.label)"
          class="flex flex-col justify-center items-center w-25%"
        >
          <view><u-icon :name="getSvgURL('parkingFee', item.img)" size="60rpx" /></view>
          <view class="mt-16rpx text-28rpx">{{ item.label }}</view>
        </view>
      </view>

      <view class="my-20rpx text-[#808080] text-[28rpx]">数据更新于{{ reactiveData.newData }}</view>
      <!-- 车辆信息 -->
      <view class="box-border">
        <view
          v-for="(item, index) in reactiveData.carInfoList"
          :key="index"
          class="flex justify-between w-100% p-20rpx box-border mb-20rpx bg-#FFF"
        >
          <view>
            <view class="flex items-center">
              <text class="mr-20rpx font-bold text-[34rpx]">{{ item.carNumber }}</text>
              <text
                v-if="item.type"
                class="text-[#916B3C] px-20rpx py-8rpx rounded-10rpx text-[20rpx]"
                style="background: linear-gradient(to right, #ecd2a2, #fdf9f2)"
                >{{ item.type }}</text
              >
            </view>
            <view class="mt-20rpx text-[28rpx]">
              <text class="mr-30rpx text-[#A8A9B1]">入场时间</text>
              <text class="text-[#545454]">{{ item.enterTime }}</text>
            </view>
            <view class="mt-20rpx text-[28rpx]">
              <text class="mr-30rpx text-[#A8A9B1]">停车时长</text>
              <text class="text-[#545454]">{{ item.enterDuration }}</text>
            </view>
          </view>
          <view class="flex items-center" v-if="!item.type">
            <view
              class="bg-[#ECF0FD] px-30rpx py-16rpx rounded-50rpx text-#196CFF text-[22rpx]"
              @click="payTheBillClick"
            >
              立即缴费
            </view>
          </view>
        </view>
      </view>
      <view class="h-130rpx" />
    </view>
    <view class="fixed bottom-0 w-100% box-border px-80rpx bg-[#F6F7FB] pt-20rpx">
      <view
        class="mb-20rpx h-80rpx bg-[#1957E6] text-[#FFF] flex justify-center items-center rounded-10rpx"
      >
        <u-icon name="scan" size="40rpx" color="#FFF" />
        <text class="ml-10rpx">扫码缴费</text>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
