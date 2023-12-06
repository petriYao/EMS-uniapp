<script setup lang="ts">
import { ref } from 'vue'
import WeeklyCalendar from '@/components/weeklyCalendar/index.vue'

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

const time = ref(new Date())
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <XWAHeader title="预定会议室" />

    <view>
      <WeeklyCalendar v-model="time" />
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
