<script setup lang="ts">
// import { getSvgURL } from '@/utils'
import { reactive, ref, onBeforeMount } from 'vue'
import { useAppStore } from '@/store'
import router from '@/router'
import { HouseList } from '@/api'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const reactiveData = reactive({
  tabActive: 1,
  tabsList: [
    {
      name: '预约看房',
      value: 1
    },
    {
      name: '看房日程',
      value: 2
    }
  ],
  setData: {
    page: 1,
    pageSize: 10
  },
  dataList: [] as any[],
  loadMore: 'loadmore',
  scrollTop: 0,
  triggered: false,
  show: false,
  //加载时间
  loadTime: 0
})

/**标签修改 */
const onChangeTabs = (tabItem: any) => {
  console.log('tabItem', tabItem)
  reactiveData.tabActive = tabItem.value
  getData()
}

const getData = async (isReset?: boolean) => {
  if (isReset) {
    reactiveData.setData.page = 1
    reactiveData.loadMore = 'loading'
  }
  reactiveData.loadTime = Date.now()
  const loadTime = reactiveData.loadTime

  const res = await HouseList(reactiveData.setData, reactiveData.tabActive)
  if (loadTime != reactiveData.loadTime) return
  if (res && res.success) {
    reactiveData.dataList = res.value.list
    if (reactiveData.setData.page == res.value.page) {
      if (res.value.page <= 1) {
        reactiveData.dataList = res.value.list ?? []
        setScrollTop()
      } else if (res.value.list) {
        reactiveData.dataList.push(...res.value.list)
      }
      if (reactiveData.dataList.length >= res.value.total) {
        reactiveData.loadMore = 'nomore'
      } else {
        reactiveData.loadMore = 'loadmore'
      }
    }
  }
}

//置顶
const setScrollTop = () => {
  reactiveData.scrollTop = reactiveData.scrollTop == 0 ? 0.1 : 0
}

//下拉更新
const onRefresherrefresh = () => {
  reactiveData.triggered = true
  getData(true).finally(() => {
    reactiveData.triggered = false
  })
}

//上拉加载更多
const onScrolltolower = async () => {
  if (reactiveData.loadMore === 'loadmore') {
    reactiveData.loadMore = 'loading'
    reactiveData.setData.page++
    await getData()
  }
}

const payTheBillClick = (item: any) => {
  router.push({
    url: `/packageHome/viewingAppointment/HouseInfo?houseId=${item.houseId}`
  })
}
onBeforeMount(() => {
  getData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="看房预约" />
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
      :refresher-triggered="reactiveData.triggered"
      :scroll-top="reactiveData.scrollTop"
      :style="`height: calc(100vh - 88px - ${marginHeight});`"
      @scrolltolower="onScrolltolower"
      @refresherrefresh="onRefresherrefresh"
    >
      <view v-if="reactiveData.tabActive === 1" class="mt-20rpx">
        <view
          v-for="(item, index) in reactiveData.dataList"
          :key="index"
          class="p-20rpx flex bg-[#FFF]"
          style="border-bottom: 1px solid #f5f5f6"
        >
          <view class="w-200rpx">
            <u-image :src="item.houseImage.listUrl" width="200rpx" height="160rpx" />
          </view>
          <view class="flex flex-col justify-between ml-20rpx">
            <view class="text-30rpx font-bold">{{ item.houseName }}</view>
            <view class="text-24rpx">{{ item.houseDes }}</view>
            <view class="text-28rpx text-red">{{ item.housePrice }}</view>
          </view>
          <view class="flex-1 flex items-center justify-end">
            <view
              class="bg-[#ECF0FD] px-30rpx py-16rpx rounded-50rpx text-#196CFF text-[22rpx]"
              @click="payTheBillClick(item)"
            >
              立即预约
            </view>
          </view>
        </view>
      </view>
      <view v-else>
        <view
          v-for="(item, index) in reactiveData.dataList"
          :key="index"
          class="p-20rpx bg-[#FFF] mt-20rpx"
          style="border-bottom: 1px solid #f5f5f6"
        >
          <view
            class="flex justify-between pb-20rpx text-28rpx"
            style="border-bottom: 1px solid #f6f6f6"
          >
            <view class="text-#818181 flex items-center">{{ item.reservationAt }}</view>
            <view
              class="text-22rpx px-20rpx py-10rpx flex items-center rounded-6rpx"
              :class="
                item.houseReservationStatus === 1
                  ? 'state1'
                  : item.houseReservationStatus === 20
                  ? 'state2'
                  : 'state3'
              "
              >{{ item.houseReservationStatusTitle }}</view
            >
          </view>

          <view class="flex justify-between pt-20rpx">
            <view class="flex flex-col justify-between">
              <view class="text-34rpx font-bold">{{ item.houseName }}</view>
              <view class="text-24rpx">{{ item.houseDes }}</view>
              <view class="text-28rpx text-red">{{ item.housePrice }}</view>
            </view>
            <view>
              <u-image :src="item.houseImage.listUrl" width="240rpx" height="160rpx" />
            </view>
          </view>
        </view>
      </view>
      <!-- 上拉加载 -->
      <view class="h-50rpx" v-if="reactiveData.dataList.length > 9">
        <u-loadmore
          loadmore-text="上拉加载更多"
          loading-text="正在加载..."
          nomore-text="我是有底线的"
          :status="reactiveData.loadMore"
        />
      </view>
    </scroll-view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.state1 {
  background-color: #fff3e8;
  color: #ff9831;
}
.state2 {
  background-color: #e8f0ff;
  color: #357eff;
}
.state3 {
  background-color: #f2f2f2;
  color: #a6a6a6;
}
</style>
