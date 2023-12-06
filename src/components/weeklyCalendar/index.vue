<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: ''
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: Date): void
}>()

// 预定会议室
const reactiveData = reactive({
  weekDays: [] as any, //周历
  currentWeek: new Date(), //当前日期
  nowMonth: 0, //当前月份
  calendarShow: false
})
const selectedWeek = ref() //选择的日期

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
    if (
      selectedWeek.value &&
      currentDate.toLocaleDateString() === selectedWeek.value.toLocaleDateString()
    ) {
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
    emit('update:modelValue', reactiveData.currentWeek)
  }
}

const confirm = (val: any) => {
  reactiveData.currentWeek = new Date(val[0])
  selectedWeek.value = new Date(val[0])
  updateWeekDays()
  emit('update:modelValue', reactiveData.currentWeek)
  reactiveData.calendarShow = false
}

onMounted(() => {
  // if (props.modelValue) {
  //   reactiveData.currentWeek = props.modelValue
  // }
  updateWeekDays()
})
</script>

<template>
  <view class="flex justify-between text-[#196CFF] bg-[#FFF] px-20rpx">
    <view @click="goToSelectedWeek" class="w-240rpx flex items-center">
      <text class="mr-10rpx">{{ reactiveData.currentWeek.toLocaleDateString() }}</text>
      <u-icon name="arrow-right" color="#196CFF" />
    </view>
    <view @click="reactiveData.calendarShow = true" class="text-[#c1c2c7]">
      {{ reactiveData.nowMonth }}月
    </view>
    <view class="flex items-center justify-end w-240rpx">
      <view class="mr-20rpx flex items-center" @click="updateWeekDays(-1)">
        <u-icon name="arrow-left" color="#196CFF" />
        <text class="ml-10rpx">上周</text>
      </view>
      <view class="flex items-center" @click="updateWeekDays(1)">
        <text class="mr-10rpx">下周</text>
        <u-icon name="arrow-right" color="#196CFF" />
      </view>
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

  <!-- 选择时间 -->

  <u-calendar
    :show="reactiveData.calendarShow"
    @close="reactiveData.calendarShow = false"
    @confirm="confirm"
  />
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
