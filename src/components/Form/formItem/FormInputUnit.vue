<script setup lang="ts">
import { findIndex } from '@/utils'
import { onBeforeMount, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String as any,
    default: '' as string
  },
  options: {
    type: Array as any,
    default: [] as any
  },
  placeholder: {
    type: String,
    default: '' as string
  }
})

//类型式声明
const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: any): void
}>()
const data = ref({
  value: 0,
  unit: 0
})
const unit = ref()

const show = ref(false)

const confirm = (event: any) => {
  data.value.unit = event.value[0].value
  unit.value = event.value[0].label
  emit('update:modelValue', data.value)
  show.value = false
}

const inputDataChange = () => {
  emit('update:modelValue', data.value)
}

onBeforeMount(() => {
  if (!props.modelValue || props.options.length === 0) return
  if (props.modelValue && props.modelValue.value) {
    data.value.value = props.modelValue.value
  }
  if (props.modelValue.unit) {
    data.value.unit = props.modelValue.unit
  }
  const index = findIndex(props.options[0], (v: any) => v.value === data.value.unit)
  if (index > -1) {
    unit.value = props.options[0][index].label
    data.value.unit = props.options[0][index].value
  }
})
</script>
<template>
  <view>
    <u-input
      v-model="data.value"
      border="none"
      @change="inputDataChange"
      :placeholder="placeholder"
      type="number"
    >
      <template #suffix>
        <view class="w-100rpx w-160rpx">
          <view @tap.stop="show = true" class="flex items-center justify-end">
            {{ unit }}
            <view class="rotate-90 px-20rpx">
              <van-icon name="play" />
            </view>
          </view>
          <u-picker
            @cancel="show = false"
            @confirm="confirm"
            visible-item-count="6"
            keyName="label"
            :show="show"
            :columns="props.options"
          />
        </view>
      </template>
    </u-input>
  </view>
</template>
