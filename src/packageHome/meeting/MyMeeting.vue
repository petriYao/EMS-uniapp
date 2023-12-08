<script setup lang="ts">
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

import { useAppStore } from '@/store'
import { MeetingReservationList } from '@/api'
import router from '@/router'

const appStore = useAppStore()

const marginHeight = ref(appStore.notchHeight + 'px')

const reactiveData = reactive({
  loadMore: 'loading',
  triggered: false,
  scrollTop: 0,
  tabList: [
    {
      name: '未处理',
      value: 1
    },
    {
      name: '已同意',
      value: 20
    },
    {
      name: '已拒绝',
      value: 30
    },
    {
      name: '已逾期 ',
      value: 31
    }
  ],
  setData: {
    meetingReservationStatus: 1,
    page: 1,
    size: 10
  },
  list: [] as any[]
})

const getData = async () => {
  const res = await MeetingReservationList(reactiveData.setData)
  console.log('res', res)
  if (res && res.success && res.value?.page == reactiveData.setData.page) {
    if (res.value?.page == 1) {
      reactiveData.list = res.value.list ?? []
    } else if (res.value.list && res.value.list.length > 0) {
      reactiveData.list.push(...res.value.list)
    }
    if (reactiveData.list.length >= res.value.total) {
      reactiveData.loadMore = 'nomore'
    } else {
      reactiveData.loadMore = 'loadmore'
    }
  }
}

const tabsChange = (val: any) => {
  reactiveData.setData.meetingReservationStatus = val.value
  reactiveData.setData.page = 1
  if (reactiveData.scrollTop == 0) {
    reactiveData.scrollTop = 0.1
  } else {
    reactiveData.scrollTop = 0
  }
  getData()
}

const infoClick = (meetingReservationId: string) => {
  router.push({
    url: `/packageHome/meeting/MeetingInfo?meetingReservationId=${meetingReservationId}`
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
//下拉更新
const onRefresherrefresh = () => {
  reactiveData.triggered = true
  reactiveData.setData.page = 1
  getData().finally(() => {
    reactiveData.triggered = false
  })
}

onShow(() => {
  getData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="我的会议" />
    <view class="w-[100%] bg-[#FFF]">
      <u-tabs
        :list="reactiveData.tabList"
        :scrollable="false"
        lineWidth="60rpx"
        @change="tabsChange"
      />
    </view>
    <view v-if="reactiveData.list && reactiveData.list.length > 0">
      <scroll-view
        scroll-y
        refresher-enabled
        :style="`height: calc(100vh - 88px - ${marginHeight})`"
        :refresher-triggered="reactiveData.triggered"
        :scroll-top="reactiveData.scrollTop"
        @scrolltolower="onScrolltolower"
        @refresherrefresh="onRefresherrefresh"
      >
        <view class="h-20rpx" />
        <view
          v-for="(item, index) of reactiveData.list"
          :key="index"
          class="mb-20rpx flex justify-between bg-[#FFF] px-20rpx py-30rpx"
          @click="infoClick(item.meetingReservationId)"
        >
          <view>
            <view class="text-[30rpx] pb-20rpx font-700">{{
              item.meetingReservationDateTime
            }}</view>
            <view class="text-[30rpx] font-700">{{ item.meetingReservationTitle }}</view>
            <view class="text-[28rpx] pt-20rpx text-#c1c2c7">{{ item.meetingRoomName }}</view>
          </view>
          <view class="flex items-center">
            <view class="text-[#196CFF]">查看</view>
          </view>
        </view>

        <!-- 上拉加载 -->
        <view class="h-50rpx flex items-center" v-if="reactiveData.list.length > 9">
          <u-loadmore
            loadmore-text="上拉加载更多"
            loading-text="正在加载..."
            nomore-text="我是有底线的"
            :status="reactiveData.loadMore"
          />
        </view>
      </scroll-view>
    </view>

    <view v-else>
      <NoData
        text="抱歉，暂无数据哦！"
        :height="`calc(100vh - 200px - 90rpx - 180rpx - ${marginHeight})`"
        textTop="80rpx"
      />
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped></style>
