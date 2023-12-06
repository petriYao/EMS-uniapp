<script setup lang="ts">
import { reactive } from 'vue'
import WeeklyCalendar from '@/components/weeklyCalendar/index.vue'
import { MeetingReservationTimeList, MeetingReservationUpdate, MeetingRoomInfo } from '@/api'
import { onLoad } from '@dcloudio/uni-app'
import { optionsType } from '@/types/userModel'
import { formatTime } from '@/utils'

const reactiveData = reactive({
  infoData: {} as any,
  setData: {
    meetingReservationDate: new Date(), //日期
    meetingReservationStartTime: '', //预约开始时间
    meetingReservationEndTime: '', //预约结束时间
    meetingReservationTitle: '', //会议主题
    meetingRoomId: 0
  },
  list: [] as optionsType[],
  // 将星期几转换为字符串
  weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
})

//获取详情和预约时间列表
const getData = async () => {
  const res = await MeetingRoomInfo(reactiveData.setData.meetingRoomId)
  if (res && res.success) {
    reactiveData.infoData = res.value
  }

  const timeRes = await MeetingReservationTimeList(
    reactiveData.setData.meetingRoomId,
    reactiveData.setData.meetingReservationDate
  )
  if (timeRes && timeRes.success) {
    reactiveData.list = timeRes.value.list
  }
}

//立即预定
const submitClick = async () => {
  console.log('立即预定', reactiveData.setData)
  const res = await MeetingReservationUpdate(reactiveData.setData)
  if (res && res.success) {
    //返回上一页
  }
}

onLoad((val: any) => {
  reactiveData.setData.meetingRoomId = Number(val.meetingRoomId)
  getData()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="预约会议" />

    <!-- 会议室信息 -->
    <view class="flex my-20rpx bg-[#FFF] py-30rpx px-20rpx">
      <view v-if="reactiveData.infoData.imageArray">
        <u-image
          :src="reactiveData.infoData.imageArray[0].listUrl"
          width="300rpx"
          height="200rpx"
          radius="20rpx"
        />
      </view>
      <view class="ml-20rpx">
        <view class="text-[30rpx] font-700">{{ reactiveData.infoData.meetingRoomName }}</view>
        <view class="text-[28rpx] pt-20rpx text-#c1c2c7">
          {{ reactiveData.infoData.meetingRoomDes }}
        </view>
      </view>
    </view>

    <!-- 周历 -->
    <view id="weeklyCalendarId">
      <WeeklyCalendar v-model="reactiveData.setData.meetingReservationDate" />
    </view>

    <!-- 提示 -->
    <view class="time-tip"> 点击小方块进行预约，每个方块30分钟，一个小时划分2个方块 </view>

    <!-- 预约时间段 -->
    <view class="flex flex-wrap py-20rpx bg-#FFF w-100%">
      <view
        v-for="(item, index) in reactiveData.list"
        :key="index"
        class="w-[16.66vw] flex justify-center items-center mb-20rpx"
        style="height: calc(16.66vw - 30rpx)"
      >
        <view
          class="mx-15rpx w-[100%] h-[100%] flex justify-center items-center rounded-4rpx text-[#FFF] text-[24rpx]"
          :style="item.type === 1 ? 'background-color: #3067E8' : 'background-color: #F1F1F1'"
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="bg-[#FFF] p-20rpx flex text-[#9c9da2]" style="border-top: 1px solid #f2f2f2">
      <view>会议日期：</view>
      <view
        >{{ formatTime(reactiveData.setData.meetingReservationDate, 'yyyy-MM-dd') }}
        {{ reactiveData.weekdays[reactiveData.setData.meetingReservationDate.getDay()] }}</view
      >
    </view>
    <view class="bg-[#FFF] p-20rpx flex text-[#9c9da2]" style="border-top: 1px solid #f2f2f2">
      <view>会议时间：</view>
      <view>123</view>
    </view>

    <view class="mt-20rpx bg-[#FFF] p-20rpx flex items-center">
      <view>会议主题：</view>
      <view class="flex-1">
        <u-input
          placeholder="请输入会议主题"
          border="surround"
          v-model="reactiveData.setData.meetingReservationTitle"
        />
      </view>
    </view>
    <view class="h-120rpx" />
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click="submitClick"
        >立即预定</view
      >
    </view>
  </ContentWrap>
</template>

<style lang="scss" scoped>
.time-tip {
  color: #c1c2c7;
  background-color: #f6f6f6;
  font-size: 24rpx;
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #d6d7d9;
  border-bottom: 1px solid #d6d7d9;
}
.button-spread {
  background: rgb(138 163 222);
}

::v-deep .u-input {
  padding: 0 !important;
}
</style>
