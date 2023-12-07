<script setup lang="ts">
import { reactive, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import { formatTime } from '@/utils'
import { optionsType } from '@/types/userModel'
import { MeetingReservationTimeList, MeetingReservationUpdate, MeetingRoomInfo } from '@/api'

import WeeklyCalendar from '@/components/weeklyCalendar/index.vue'

const reactiveData = reactive({
  infoData: {} as any,
  meetingReservationDate: new Date(),
  isSelect: false,
  startIndex: -1,
  endIndex: -1,
  meetingReservationId: '',
  setData: {
    meetingReservationDate: '', //日期
    meetingReservationStartTime: '', //预约开始时间
    meetingReservationEndTime: '', //预约结束时间
    meetingReservationTitle: '', //会议主题
    meetingRoomId: null as number | null
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
    reactiveData.meetingReservationDate
  )
  if (timeRes && timeRes.success) {
    reactiveData.isSelect = false
    reactiveData.startIndex = -1
    reactiveData.endIndex = -1
    reactiveData.list = timeRes.value.list
  }
}

const selectTimeClick = (index: number) => {
  const item = reactiveData.list[index]
  if (item.type === 0) {
    return
  }
  if (reactiveData.isSelect) return
  reactiveData.isSelect = true

  if (item.type === 1) {
    if (reactiveData.startIndex == -1 || index == reactiveData.startIndex - 1) {
      reactiveData.startIndex = index
      item.type = 2
    } else if (reactiveData.endIndex == -1 && index == reactiveData.startIndex + 1) {
      reactiveData.endIndex = index
      item.type = 2
    } else if (index == reactiveData.endIndex + 1) {
      reactiveData.endIndex = index
      item.type = 2
    }
  } else if (item.type === 2) {
    if (index == reactiveData.startIndex) {
      item.type = 1
      if (reactiveData.endIndex > -1 && index + 1 <= reactiveData.endIndex) {
        if (index + 1 == reactiveData.endIndex) {
          reactiveData.endIndex = -1
        }
        reactiveData.startIndex = index + 1
      } else {
        reactiveData.startIndex = -1
        reactiveData.endIndex = -1
      }
    } else if (index == reactiveData.endIndex) {
      item.type = 1
      if (index - 1 == reactiveData.startIndex) {
        reactiveData.endIndex = -1
      } else if (index - 1 > reactiveData.startIndex) {
        reactiveData.endIndex = index - 1
      }
    }
  }
  reactiveData.isSelect = false
}

//立即预定
const submitClick = async () => {
  const res = await MeetingReservationUpdate(reactiveData.setData)
  if (res && res.success) {
    //返回上一页
  }
}

watch(
  () => reactiveData.meetingReservationDate,
  async () => {
    console.log('日期改变了', reactiveData.meetingReservationDate)
    reactiveData.setData.meetingReservationDate = formatTime(
      reactiveData.meetingReservationDate,
      'yyyy-MM-dd'
    )

    const timeRes = await MeetingReservationTimeList(
      reactiveData.setData.meetingRoomId,
      reactiveData.setData.meetingReservationDate
    )
    if (timeRes && timeRes.success) {
      reactiveData.isSelect = false
      reactiveData.startIndex = -1
      reactiveData.endIndex = -1
      reactiveData.list = timeRes.value.list
    }
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  () => [reactiveData.startIndex, reactiveData.endIndex],
  () => {
    if (reactiveData.startIndex > -1) {
      //开始时间
      reactiveData.setData.meetingReservationStartTime =
        reactiveData.list[reactiveData.startIndex].label

      //结束时间
      let endIndex = reactiveData.startIndex
      if (reactiveData.endIndex > -1) {
        endIndex = reactiveData.endIndex
      }
      if (endIndex == reactiveData.list.length) {
        reactiveData.setData.meetingReservationEndTime = '21:00'
      } else {
        reactiveData.setData.meetingReservationEndTime = reactiveData.list[endIndex + 1].label
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
)

onLoad((val: any) => {
  if (val.meetingRoomId) {
    reactiveData.setData.meetingRoomId = Number(val.meetingRoomId)
    getData()
  } else {
    reactiveData.meetingReservationId = val.meetingReservationId
  }
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
      <WeeklyCalendar v-model="reactiveData.meetingReservationDate" />
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
        @click="selectTimeClick(index)"
      >
        <view
          class="mx-15rpx w-[100%] h-[100%] flex justify-center items-center rounded-4rpx text-[#FFF] text-[24rpx]"
          :style="
            item.type === 0
              ? 'background-color: #DCE4F7;color:#9c9da2'
              : item.type === 1
              ? 'background-color: #3067E8'
              : 'background-color: #FFC300'
          "
        >
          {{ item.label }}
        </view>
      </view>
    </view>

    <view class="bg-[#FFF] p-20rpx flex text-[#9c9da2]" style="border-top: 1px solid #f2f2f2">
      <view>会议日期：</view>
      <view
        >{{ reactiveData.setData.meetingReservationDate }}
        {{ reactiveData.weekdays[reactiveData.meetingReservationDate.getDay()] }}</view
      >
    </view>
    <view class="bg-[#FFF] p-20rpx flex text-[#9c9da2]" style="border-top: 1px solid #f2f2f2">
      <view>会议时间：</view>
      <view>{{
        reactiveData.setData.meetingReservationStartTime +
        ' - ' +
        reactiveData.setData.meetingReservationEndTime
      }}</view>
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
    <view class="fixed w-100% box-border bottom-0 bg-[#F6F7FB] pb-20rpx px-20rpx z-999">
      <view
        class="w-[100%] bg-[#466BF3] text-[#FFF] rounded-8rpx h-80rpx flex items-center justify-center"
        hover-class="button-spread"
        @click="submitClick"
        >立即预约</view
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
