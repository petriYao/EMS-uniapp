<script setup lang="ts">
import { isEmpty } from '@/utils/toolUtils'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
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

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()
const data = ref()
const dataShow = ref()
const show = ref(false)
//select选择
const confirm = (event: any) => {
  dataShow.value = event.value[0].label
  emit('update:modelValue', event.value[0].value)
  show.value = false
}

const showClick = () => {
  if (!props.disabled) {
    show.value = true
  } else {
    wx.showToast({
      title: '该项不可修改!', // 标题
      icon: 'error', // 图标类型，默认success
      duration: 1500 // 提示窗停留时间，默认1500ms
    })
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (isEmpty(val)) return
    if (props.options) {
      for (const item of props.options[0]) {
        if (item.value === val) {
          dataShow.value = item.label
        }
      }
    }

    data.value = val
  },
  {
    immediate: true,
    deep: true
  }
)
</script>
<template>
  <view class="py-30rpx relative" @click.stop="showClick">
    <!-- APP上加了readonly，就没有点击效果了 -->
    <!-- #ifdef H5 -->
    <view class="absolute w-100% h-100% top-0 z-99" />
    <!-- #endif -->

    <view>
      <u-input
        readonly
        v-model="dataShow"
        border="none"
        :placeholder="placeholder"
        suffixIcon="arrow-right"
        suffixIconStyle="color: #909399"
      />
    </view>
    <u-picker
      @cancel="show = false"
      @confirm="confirm"
      visible-item-count="6"
      keyName="label"
      :show="show"
      :columns="props.options"
      closeOnClickOverlay
    />
  </view>
</template>
