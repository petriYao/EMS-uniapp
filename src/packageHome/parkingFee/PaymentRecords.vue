<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const reactiveData = reactive({
  list: [
    {
      infoData: {
        carNumber: '闽A·860R08',
        enterPrice: '30.00',
        enterTime: '12-08 04:30:56',
        enterDuration: {
          hour: '3',
          minute: '30'
        },
        outTime: '未出场'
      }
    },
    {
      infoData: {
        carNumber: '闽A·860R08',
        enterPrice: '30.00',
        enterTime: '12-08 04:30:56',
        enterDuration: {
          hour: '14',
          minute: '00'
        },
        outTime: '12-08 16:30:56'
      }
    }
  ]
})

onLoad(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="停车缴费记录" />
    <!-- 头部结束 -->
    <view class="m-20rpx">
      <!-- 头部管理列表 -->
      <view
        v-for="(item, index) of reactiveData.list"
        :key="index"
        class="bg-[#FFF] rounded-10rpx px-20rpx py-30rpx box mb-20rpx"
      >
        <view class="font-bold text-[34rpx]">{{ item.infoData.carNumber }}</view>
        <view
          class="flex justify-between pb-20rpx mt-20rpx"
          style="border-bottom: 1px dashed #bdbdbd"
        >
          <view>
            <view class="text-[#707070]">停车费用</view>
            <view class="text-[#245FE7] text-[30rpx] mt-20rpx">
              {{ item.infoData.enterPrice }}元</view
            >
          </view>
          <view>
            <view class="text-[#707070] text-end">停车时长</view>
            <view class="mt-20rpx text-[30rpx] text-[#0D0D0D]">
              {{ item.infoData.enterDuration.hour }}小时{{ item.infoData.enterDuration.minute }}分
            </view>
          </view>
        </view>

        <view class="flex justify-between mt-20rpx">
          <view>
            <view class="text-[#707070]">入场时间</view>
            <view class="mt-20rpx text-[#0D0D0D] text-[28rpx]">{{ item.infoData.enterTime }}</view>
          </view>
          <view>
            <view class="text-[#707070] text-end">出场时间</view>
            <view class="mt-20rpx text-end text-[#0D0D0D] text-[28rpx]">{{
              item.infoData.outTime
            }}</view>
          </view>
        </view>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.box {
  box-shadow: 6px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
