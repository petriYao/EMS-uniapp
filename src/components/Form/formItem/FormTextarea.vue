<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '' as string
  },
  maxlength: {
    type: String,
    default: '255' as string
  },
  count: {
    type: Boolean,
    default: false as boolean
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
  <!-- placeholderStyle="background-color: #f4f5f7 !important;" 没有用 -->
  <view>
    <u-textarea
      v-model="data"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :count="count"
      autoHeight
      :show-confirm-bar="false"
      @change="inputDataChange"
    />
  </view>
</template>
<style lang="less" scoped>
//没有用
// ::v-deep .u-textarea {
//   background-color: #f4f5f7 !important;
//   min-height: 80rpx !important;
//   border-radius: 10rpx !important;
// }
</style>
