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
  pickerShow.value = true
  data.value
}

const confirm = (event: any) => {
  pickerData.value = event.detail
  data.value = formatTime(pickerData.value, 'yyyy-MM-dd HH:mm')
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
  <view @tap.stop="pickerShowClick">
    <u-input readonly v-model="data" border="none" :placeholder="placeholder" />
  </view>
  <view>
    <van-action-sheet :show="pickerShow">
      <van-datetime-picker
        :min-date="new Date('1970-01-01')"
        :max-date="new Date('2100-12-31')"
        :value="pickerData"
        @confirm="confirm"
        @cancel="pickerShow = false"
        type="datetime"
      />
    </van-action-sheet>
  </view>
</template>
