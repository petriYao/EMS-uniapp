<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false as any
  },
  placeholder: {
    type: String,
    default: '' as string
  }
})
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: Boolean): void
}>()
const data = ref<any>(false)
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
    <u-switch v-model="data" @change="inputDataChange" />
  </view>
</template>
