<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { getImageURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive } from 'vue'

const reactiveData = reactive({
  infoData: {
    carNumber: '闽A·860R08',
    enterPrice: '30.00',
    enterTime: new Date().toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }),
    enterDuration: {
      hour: '3',
      minute: '30'
    },
    outTime: '未出场'
  },
  list1: [
    { label: '会员权益', value: '-4.00元' },
    { label: '停车优惠卷', value: '-5.00元' }
  ],
  list2: [
    { label: '应付金额', value: '21.00元' },
    { label: '累计扣减', value: '-9.00元' }
  ]
})

onLoad(async () => {})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="车费详情" />
    <!-- 头部结束 -->
    <view>
      <view>
        <u-image :src="getImageURL('parkingFee', 'bg')" width="100%" height="300rpx" />
      </view>
      <view
        class="bg-[#FFF] mt-[-60rpx] mx-20rpx rounded-10rpx px-20rpx py-40rpx relative z-11 box"
      >
        <view class="text-[#707070]">车牌号</view>
        <view class="font-bold text-[34rpx] mt-20rpx">{{ reactiveData.infoData.carNumber }}</view>
        <view
          class="flex justify-between pb-20rpx mt-20rpx"
          style="border-bottom: 1px dashed #bdbdbd"
        >
          <view>
            <view class="text-[#707070]">停车费用</view>
            <view class="text-[#0D0D0D] mt-20rpx">
              <text class="text-[48rpx] font-bold">{{ reactiveData.infoData.enterPrice }}</text
              >元</view
            >
          </view>
          <view>
            <view class="text-[#707070] text-end">停车时长</view>
            <view class="mt-20rpx text-[#0D0D0D]">
              <text class="text-[48rpx] font-bold">
                {{ reactiveData.infoData.enterDuration.hour }} </text
              >小时<text class="text-[48rpx] font-bold">
                {{ reactiveData.infoData.enterDuration.minute }} </text
              >分
            </view>
          </view>
        </view>

        <view class="flex justify-between mt-20rpx">
          <view>
            <view class="text-[#707070]">入场时间</view>
            <view class="mt-20rpx text-[#0D0D0D]">{{ reactiveData.infoData.enterTime }}</view>
          </view>
          <view>
            <view class="text-[#707070] text-end">出场时间</view>
            <view class="mt-20rpx text-end text-[#0D0D0D]">未出场</view>
          </view>
        </view>
      </view>

      <view class="bg-[#FFF] m-20rpx mb-0 rounded-10rpx px-20rpx py-10rpx box">
        <view
          v-for="(item, index) of reactiveData.list1"
          :key="index"
          class="flex justify-between text-[28rpx] py-20rpx"
        >
          <view
            >{{ item.label
            }}<text
              v-if="item.label === '停车优惠卷'"
              class="bg-[#FFC300] text-[#FFF] px-10rpx ml-10rpx text-[24rpx]"
              >车卷</text
            ></view
          >
          <view class="font-bold">{{ item.value }}</view>
        </view>
      </view>

      <view class="bg-[#FFF] m-20rpx mb-0 rounded-10rpx px-20rpx py-10rpx box">
        <view
          v-for="(item, index) of reactiveData.list2"
          :key="index"
          class="flex justify-between text-[28rpx] py-20rpx"
        >
          <view>{{ item.label }}</view>
          <view class="font-bold" :style="item.label === '累计扣减' ? 'color:#EE4848' : ''">
            {{ item.value }}
          </view>
        </view>
      </view>
    </view>

    <view class="fixed bottom-0 w-100% box-border px-80rpx">
      <view
        class="mb-20rpx bg-[#1957E6] text-[#FFF] flex justify-center items-center h-80rpx rounded-10rpx"
      >
        <text class="ml-10rpx">立即支付</text>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.box {
  box-shadow: 6px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>
