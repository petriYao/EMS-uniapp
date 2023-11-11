<script setup lang="ts">
import { getSvgURL } from '@/utils'
import { computed } from 'vue'

const props = defineProps({
  treeIndex: {
    type: Number as any,
    default: 0
  }
})

const nameIcon = computed(() => {
  switch (props.treeIndex) {
    case 1:
      return getSvgURL('tree', 'one')
    case 2:
      return getSvgURL('tree', 'two')
    case 3:
      return getSvgURL('tree', 'three')
    case 4:
      return getSvgURL('tree', 'four')
    case 5:
      return getSvgURL('tree', 'five')
  }
  return getSvgURL('tree', 'one')
})
</script>

<template>
  <view>
    <van-icon :name="nameIcon" size="40rpx" />
  </view>
</template>
