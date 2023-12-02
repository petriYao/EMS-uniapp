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
    console.log('data.value', data.value)
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <view class="relative">
    <!-- APP上加了readonly，就没有点击效果了 -->
    <!-- #ifdef H5 -->
    <view class="absolute w-100% h-100% top-0 z-99" />
    <!-- #endif -->
    <view @tap.stop="show = true">
      <u-input
        readonly
        v-model="data"
        border="none"
        :placeholder="placeholder"
        suffixIcon="arrow-right"
        suffixIconStyle="color: #909399"
      />
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
