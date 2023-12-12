<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String as any,
    default: '' as string
  },
  options: {
    type: Object as any,
    default: [] as any
  },
  placeholder: {
    type: String,
    default: '' as string
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const data = ref()
const show = ref(false)
//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: any): void
}>()

const showClick = () => {
  if (!props.disabled) {
    show.value = true
  } else {
    uni.showToast({
      title: '该项不可修改!', // 标题
      icon: 'error', // 图标类型，默认success
      duration: 1500 // 提示窗停留时间，默认1500ms
    })
  }
}

const onClose = () => {
  show.value = false
}
const onSelect = (event: any) => {
  data.value = event.detail.name
  emit('update:modelValue', event.detail.value)
}

onMounted(() => {
  if (props.modelValue || props.modelValue === 0) {
    props.options.forEach((val: any) => {
      if (val.value == props.modelValue) {
        data.value = val.name
      }
    })
  }
})
</script>

<template>
  <view>
    <view @tap.stop="showClick">
      <u-input
        readonly
        v-model="data"
        border="none"
        :placeholder="placeholder"
        suffixIcon="arrow-right"
        suffixIconStyle="color: #909399"
      />
    </view>
    <van-action-sheet
      :show="show"
      :actions="props.options"
      :z-index="999"
      cancel-text="取消"
      @close="onClose"
      @cancel="onClose"
      @select="onSelect"
    />
  </view>
</template>

<style lang="less" scoped></style>
