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
const data = ref()
const inputDataChange = () => {
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
    <u-input v-model="data" border="none" :placeholder="placeholder" @change="inputDataChange" />
  </view>
</template>
