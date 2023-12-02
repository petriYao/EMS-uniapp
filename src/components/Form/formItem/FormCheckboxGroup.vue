<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,

    default: '' as string
  },

  options: {
    type: Object as any,

    default: [] as any
  }
})

//类型式声明

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): void
}>()

const data = ref()

//select选择

const checkboxChange = (event: any) => {
  emit('update:modelValue', event)
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
    <u-checkbox-group v-model="data" placement="row" shape="circle" @change="checkboxChange">
      <u-checkbox
        :customStyle="{ marginRight: '20rpx' }"
        v-for="(item, index) in props.options"
        :key="index"
        :label="item.name"
        :name="item.name"
      />
    </u-checkbox-group>
  </view>
</template>

<style lang="less" scoped></style>
