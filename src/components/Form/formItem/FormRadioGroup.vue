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

//select选择

const onChange = (event: any) => {
  emit('update:modelValue', event.detail)
  show.value = false
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
    <u-radio-group :value="data" placement="row" @change="onChange">
      <u-radio
        v-for="(item, index) of props.options"
        :key="index"
        :name="item.name"
        style="margin-right: 20rpx"
        >{{ item.name }}</u-radio
      >
    </u-radio-group>
  </view>
</template>

<style lang="less" scoped></style>
