<script setup lang="ts">
import { ref, watch, reactive } from 'vue'
import { formatTime } from '@/utils'

const props = defineProps({
  modelValue: {
    type: String,
    default: '' as string
  },
  placeholder: {
    type: String,
    default: '' as string
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()
const data = ref()
const show = ref(false)
const timeValue = ref(new Date() as any)

/**确认 */
const onConfirm = (val: any) => {
  data.value = formatTime(val.value, 'yyyy-MM-dd HH:mm')
  show.value = false
  emit('update:modelValue', data.value)
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    data.value = val
    timeValue.value = val
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <view class="relative">
    <view @click="show = true" class="h-24px flex items-center justify-between text-[14px]">
      <view>
        <text v-if="data">{{ data }}</text>
        <text v-else class="text-[#C0C4CC]">{{ placeholder }}</text>
      </view>
      <view><u-icon name="arrow-right" size="14" /></view>
    </view>
    <u-datetime-picker
      :show="show"
      v-model="timeValue"
      mode="datetime"
      @cancel="show = false"
      @confirm="onConfirm"
    />
  </view>
</template>
