<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

// 预定会议室
const reactiveData = reactive({
  weekDays: [] as any, //周历
  currentWeek: new Date(), //当前日期
  nowMonth: 0, //当前月份
  calendarShow: false
})
const selectedWeek = ref() //选择的日期

const timeList = ref([
  { label: '09:00', value: '09:00' },
  { label: '09:30', value: '09:30' },
  { label: '10:00', value: '10:00' },
  { label: '10:30', value: '10:30' },
  { label: '11:00', value: '11:00' },
  { label: '11:30', value: '11:30' },
  { label: '12:00', value: '12:00' },
  { label: '12:30', value: '12:30' },
  { label: '13:00', value: '13:00' },
  { label: '13:30', value: '13:30' },
  { label: '14:00', value: '14:00' },
  { label: '14:30', value: '14:30' },
  { label: '15:00', value: '15:00' },
  { label: '15:30', value: '15:30' },
  { label: '16:00', value: '16:00' },
  { label: '16:30', value: '16:30' },
  { label: '17:00', value: '17:00' },
  { label: '17:30', value: '17:30' },
  { label: '18:00', value: '18:00' },
  { label: '18:30', value: '18:30' },
  { label: '19:00', value: '19:00' },
  { label: '19:30', value: '19:30' },
  { label: '20:00', value: '20:00' },
  { label: '20:30', value: '20:30' }
])

const updateWeekDays = (offset = 0) => {
  reactiveData.currentWeek.setDate(reactiveData.currentWeek.getDate() + offset * 7)
  const now = new Date(reactiveData.currentWeek)
  const dayOfWeek = now.getDay() || 7
  now.setDate(now.getDate() + 1 - dayOfWeek)
  reactiveData.nowMonth = now.getMonth() + 1 //当前月份
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  reactiveData.weekDays = []
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)
    currentDate.setHours(0, 0, 0, 0)
    let status = ''

    if (currentDate.getTime() < today.getTime()) {
      status = 'past'
    } else if (currentDate.getTime() > today.getTime()) {
      status = 'future'
    } else {
      // 如果selectedWeek有值，不设置初始的today
      if (!selectedWeek.value) {
        status = 'today'
      } else {
        status = 'future'
      }
    }

    // 如果当前日期等于selectedWeek，设置status为today
    if (selectedWeek.value && currentDate.getTime() === selectedWeek.value.getTime()) {
      status = 'today'
    }

    reactiveData.weekDays.push({
      day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      date: currentDate,
      status: status
    })
  }
}
const goToSelectedWeek = () => {
  reactiveData.currentWeek = new Date(selectedWeek.value)
  updateWeekDays()
}

const selectDate = (item: any) => {
  if (item.status !== 'past') {
    reactiveData.currentWeek = new Date(item.date)
    selectedWeek.value = new Date(item.date)
    reactiveData.weekDays = reactiveData.weekDays.map((day: any) => {
      if (day.status === 'today') {
        day.status = 'future'
      }
      if (day.date === item.date) {
        day.status = 'today'
      }
      return day
    })
  }
}

onMounted(() => {
  updateWeekDays()
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="预定会议室" />

    <view class="flex justify-between">
      <view @click="goToSelectedWeek">{{ reactiveData.currentWeek.toLocaleDateString() }}</view>
      <view @click="reactiveData.calendarShow = true">{{ reactiveData.nowMonth }}月</view>
      <view class="flex">
        <view class="mr-20rpx" @click="updateWeekDays(-1)">上周</view>
        <view class="mr-20rpx" @click="updateWeekDays(1)">下周</view>
      </view>
    </view>
    <!-- 添加日期和星期的显示 -->
    <view class="flex justify-between p-20rpx bg-#FFF">
      <view
        v-for="(item, index) in reactiveData.weekDays"
        :key="index"
        class="flex flex-col items-center justify-center"
      >
        <view class="text-[#c1c2c7]">{{ item.day }}</view>
        <view class="week-date" :class="item.status" @click="selectDate(item)">{{
          item.date.getDate()
        }}</view>
      </view>
    </view>

    <view class="flex flex-wrap py-20rpx bg-#FFF">
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
    </view>

    <!-- 选择时间 -->

    <u-calendar :show="reactiveData.calendarShow" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
.week-date {
  width: 80rpx;
  height: 80rpx;
  margin-top: 20rpx;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.past {
  color: #c1c2c7;
  background-color: #f0f1f2;
}
.today {
  color: #fff;
  background-color: #466bf3;
}
.future {
  color: #2c2e43;
  background-color: #f0f1f2;
}
</style>
