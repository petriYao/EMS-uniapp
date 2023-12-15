<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatTime } from '@/utils'

const props = defineProps({
  modelValue: {
    type: String as any,
    default: '' as any
  },
  placeholder: {
    type: String,
    default: '' as string
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

const data = ref()
const pickerShow = ref(false)
const pickerData = ref(new Date() as any)
const pickerShowClick = () => {
  console.log('点击')
  pickerShow.value = true
  data.value
}

const confirm = (event: any) => {
  pickerData.value = event.detail
  data.value = formatTime(pickerData.value, 'yyyy-MM-dd HH:mm')
  console.log('data', event)
  pickerShow.value = false
  emit('update:modelValue', data.value)
}
watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    data.value = val
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <view @click="pickerShowClick" class="h-24px flex items-center text-[14px]">
    <text v-if="data">{{ data }}</text>
    <text v-else class="text-[#C0C4CC]">{{ placeholder }}</text>
  </view>
  <view>
    <u-calendar :show="pickerShow" @confirm="confirm" />
  </view>
</template>
