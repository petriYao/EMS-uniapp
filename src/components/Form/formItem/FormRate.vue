<script setup lang="ts">
import { ref, watch } from 'vue'

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
const data = ref(props.modelValue)

const inputDataChange = (event: any) => {
  data.value = event.detail
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
  <view>
    <van-rate
      active-color="#FA3534"
      inactive-color="#b2b2b2"
      gutter="20"
      :value="data"
      @change="inputDataChange"
    />
  </view>
</template>
