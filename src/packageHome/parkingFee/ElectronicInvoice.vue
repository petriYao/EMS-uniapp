<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { getLocal } from '@/hooks/useCache'
import { formatTime } from '@/utils'
import { useAppStore } from '@/store'
import router from '@/router'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const reactiveData = reactive({
  tabActive: 1,
  tabsList: [
    {
      name: '开票订单',
      value: 1
    },
    {
      name: '开票记录',
      value: 2
    }
  ],
  isSelect: false,
  allPrice: 80,
  orderNumber: 1,
  actionHeight: '140px',
  orderList: [
    {
      carPhone: '闽A · 860R088',
      time: new Date(),
      duration: '3小时30分钟',
      price: '80',
      id: '1',
      isSelect: false
    },
    {
      carPhone: '闽A · 860R088',
      time: new Date(),
      duration: '3小时30分钟',
      price: '80',
      id: '2',
      isSelect: true
    },
    {
      carPhone: '闽A · 860R088',
      time: new Date(),
      duration: '3小时30分钟',
      price: '80',
      id: '3',
      isSelect: false
    },
    {
      carPhone: '闽A · 860R088',
      time: new Date(),
      duration: '3小时30分钟',
      price: '80',
      id: '4',
      isSelect: false
    }
  ] as any[],
  recordList: [
    {
      company: '北京科技贸易有限公司',
      time: new Date(),
      price: 80,
      type: 1
    },
    {
      company: '北京科技贸易有限公司',
      time: new Date(),
      price: 80,
      type: 2
    },
    {
      company: '北京科技贸易有限公司',
      time: new Date(),
      price: 80,
      type: 1
    },
    {
      company: '北京科技贸易有限公司',
      time: new Date(),
      price: 80,
      type: 1
    }
  ],
  show: false
})

/**标签修改 */
const onChangeTabs = (tabItem: any) => {
  console.log('tabItem', tabItem)
  reactiveData.tabActive = tabItem.value
}
//单选
const selectClick = (event: any) => {
  event.isSelect = !event.isSelect
  if (event.isSelect) {
    reactiveData.allPrice += Number(event.price)
    reactiveData.orderNumber += 1
  } else {
    reactiveData.allPrice -= Number(event.price)
    reactiveData.orderNumber -= 1
  }
}
//全选
const allSelectClick = () => {
  reactiveData.isSelect = !reactiveData.isSelect
  reactiveData.allPrice = 0
  reactiveData.orderNumber = 0
  if (reactiveData.isSelect) {
    reactiveData.orderList.forEach((item: any) => {
      item.isSelect = true
      reactiveData.allPrice += Number(item.price)
      reactiveData.orderNumber += 1
    })
  } else {
    reactiveData.orderList.forEach((item: any) => {
      item.isSelect = false
    })
  }
}

//去开票
const goInvoice = () => {
  router.push({
    url: `/packageHome/parkingFee/InvoiceRecords?allPrice=${reactiveData.allPrice}`
  })
}

onLoad(async () => {
  let val = getLocal('billList')
  if (val) {
    reactiveData.orderList = JSON.parse(val)
  }
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="电子发票" />
    <view class="bg-[#FFF]">
      <u-tabs
        :list="reactiveData.tabsList"
        :scrollable="false"
        activeStyle="color:#196CFF"
        lineColor="#196CFF"
        lineWidth="120rpx"
        @change="onChangeTabs"
      />
    </view>
    <!-- 头部结束 -->
    <scroll-view
      refresher-enabled
      scroll-y
      :style="`height: calc(100vh - 88px - ${marginHeight} - ${
        reactiveData.tabActive === 1 ? '140rpx' : '0px'
      });`"
    >
      <view class="text-[#808080]" v-if="reactiveData.tabActive === 1">
        <view
          v-for="(item, index) in reactiveData.orderList"
          :key="index"
          class="bg-[#FFF] mx-20rpx mt-20rpx rounded-10rpx p-20rpx flex"
          @click="selectClick(item)"
        >
          <view class="mr-20rpx flex items-center justify-center">
            <view
              class="w-40rpx h-40rpx text-0 rounded-50% flex justify-center items-center"
              :style="`background: ${item.isSelect ? '#196CFF' : '#E5E5E5'}`"
            >
              <u-icon v-if="item.isSelect" name="checkbox-mark" color="#FFF" />
            </view>
          </view>
          <view>
            <view class="text-32rpx text-[#191919] font-bold">{{ item.carPhone }}</view>
            <view class="mt-20rpx">
              <text class="mr-20rpx text-[#BEBFC5]">入场时间</text>
              <text class="text-[#555555]"> {{ formatTime(item.time, 'yyyy-MM-dd HH:mm') }}</text>
            </view>
            <view class="mt-20rpx">
              <text class="mr-20rpx text-[#BEBFC5]">停车时长</text>
              <text class="text-[#555555]"> {{ item.duration }}</text>
            </view>
          </view>
          <view class="flex-1 flex items-center justify-end text-32rpx text-[#191919]">
            ￥{{ item.price }}
          </view>
        </view>
      </view>
      <view v-else>
        <view
          v-for="(item, index) in reactiveData.recordList"
          :key="index"
          class="bg-[#FFF] mx-20rpx mt-20rpx rounded-10rpx p-20rpx flex"
        >
          <view>
            <view class="text-30rpx text-[#191919] font-bold">{{ item.company }}</view>
            <view class="mt-20rpx text-[#BEBFC5]">
              <text class="mr-20rpx">开票时间:</text>
              <text class="text-[#555555]"> {{ formatTime(item.time, 'yyyy-MM-dd HH:mm') }}</text>
            </view>
          </view>
          <view class="flex-1 flex items-center justify-end text-32rpx text-[#191919]">
            ￥{{ item.price }}
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bg-[#FFF] h-140rpx flex items-center px-20rpx" v-if="reactiveData.tabActive === 1">
      <view class="flex flex-col justify-center items-center mr-20rpx" @click="allSelectClick">
        <view
          class="w-40rpx h-40rpx text-0 rounded-50% flex justify-center items-center"
          :style="`background: ${reactiveData.isSelect ? '#196CFF' : '#E5E5E5'}`"
        >
          <u-icon v-if="reactiveData.isSelect" name="checkbox-mark" color="#FFF" />
        </view>
        <view class="mt-10rpx">全选</view>
      </view>

      <view class="flex-1 flex text-#FFF h-80rpx text-28rpx">
        <view class="w-400rpx flex items-center bg-#364C73 h-[inherit] pl-20rpx rounded-l-lg">
          <text class="mr-10rpx">
            {{ reactiveData.allPrice.toFixed(2) }}
          </text>
          <text class="text-24rpx mr-20rpx">元</text>
          <text class="text-24rpx">共{{ reactiveData.orderNumber }}个订单</text>
        </view>
        <view
          class="flex-1 flex items-center bg-#1957E6 h-[inherit] pl-20rpx rounded-r-lg"
          @click="goInvoice"
        >
          去开票
        </view>
      </view>
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
