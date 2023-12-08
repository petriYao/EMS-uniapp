<script setup lang="ts">
import { reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'

import { useAppStore } from '@/store'
import { MeetingRoomListType } from '@/types/userModel'
import { MeetingRoomList } from '@/api'
import router from '@/router'

import WeeklyCalendar from '@/components/weeklyCalendar/index.vue'

const appStore = useAppStore()

const reactiveData = reactive({
  setData: {
    date: new Date(), //日期
    page: 1, //分页号码
    size: 10 //分页数量
  },
  list: [] as MeetingRoomListType[],
  weeklyCalendarHeight: ''
})

const getData = async () => {
  const res = await MeetingRoomList(reactiveData.setData)
  console.log('res', res)
  if (res && res.success) {
    reactiveData.list = res.value.list
  }
}

const infoClick = (meetingRoomId: string) => {
  router.push({
    url: `/pages/meeting/MeetingInfo?meetingRoomId=${meetingRoomId}`
  })
}

const initData = () => {
  // uniapp根据id获取weeklyCalendarId高度
  const query = uni.createSelectorQuery()
  setTimeout(() => {
    query
      .select('#weeklyCalendarId')
      .boundingClientRect((rect: any) => {
        reactiveData.weeklyCalendarHeight = rect.height + appStore.notchHeight + 'px'
      })
      .exec()
  }, 300)

  getData()
}

onShow(() => {
  initData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="预定会议" />
    <view class="h-20rpx" />
    <view id="weeklyCalendarId">
      <WeeklyCalendar v-model="reactiveData.setData.date" />
    </view>

    <scroll-view
      scroll-y
      :style="`height: calc(100vh - 44px - 40rpx - ${reactiveData.weeklyCalendarHeight});`"
    >
      <view class="h-20rpx" />
      <view
        v-for="(item, index) of reactiveData.list"
        :key="index"
        class="mb-20rpx flex justify-between bg-[#FFF] px-20rpx py-30rpx"
        @tap.stop="infoClick(item.meetingRoomId)"
      >
        <view>
          <view class="text-[30rpx] font-700">{{ item.meetingRoomName }}</view>
          <view class="text-[28rpx] pt-20rpx text-#c1c2c7">{{ item.meetingRoomDes }}</view>
        </view>
        <view class="flex items-center">
          <view
            class="mr-30rpx w-100rpx h-40rpx flex items-center justify-center text-[22rpx]"
            :class="item.meetingRoomStatus === 1 ? 'status-tag' : 'status-un-tag'"
            >{{ item.meetingRoomStatus === 1 ? '可预定' : '已约满' }}</view
          >
          <view class="text-[#196CFF]">查看</view>
        </view>
      </view>
    </scroll-view>

    <!-- <view class="flex flex-wrap py-20rpx bg-#FFF">
      <view
        v-for="item in timeList"
        :key="item.value"
        class="w-[16.66vw] flex justify-center items-center mb-20rpx"
        style="height: calc(16.66vw - 30rpx)"
      >
        <view
          class="mx-15rpx bg-[red] w-[100%] h-[100%] flex justify-center items-center rounded-4rpx text-[#FFF] text-[24rpx]"
        >
          {{ item.label }}
        </view>
      </view>
    </view> -->
  </ContentWrap>
</template>

<style lang="scss" scoped>
.status-tag {
  background-color: #e8eefc;
  color: #196cff;
}

.status-un-tag {
  color: #c1c2c7;
  background-color: #f0f1f2;
}
</style>
