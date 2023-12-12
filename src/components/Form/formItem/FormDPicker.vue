<script setup lang="ts">
import { isEmpty } from 'lodash-es'
import { ref, watch } from 'vue'

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

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()
const data = ref()
const show = ref(false)

//select选择
const confirm = (event: any) => {
  emit('update:modelValue', event.value[0].value)
  show.value = false
}

const showClick = () => {
  if (props.disabled) {
    uni.showToast({
      title: '该项不可修改!', // 标题
      icon: 'error', // 图标类型，默认success
      duration: 1500 // 提示窗停留时间，默认1500ms
    })
    return
  }
  if (isEmpty(props.options)) {
    uni.showToast({
      title: '暂无选项数据!', // 标题
      icon: 'error', // 图标类型，默认success
      duration: 1500 // 提示窗停留时间，默认1500ms
    })
    return
  }
  show.value = true
}

watch(
  () => props.modelValue,
  (val) => {
    if (val || val === 0) {
      const selectItem = props.options[0].filter((item: any) => item.value === val)
      data.value = selectItem[0].label
    }
  },
  {
    immediate: true,
    deep: true
  }
)
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
