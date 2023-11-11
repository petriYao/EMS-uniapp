<script setup lang="ts">
import { PropType } from 'vue'
import TreeSon from './src/TreeSon.vue'

const props = defineProps({
  treeData: {
    type: Array as any,
    default: () => []
  },
  parentName: {
    type: String as PropType<any>,
    default: '' as String
  },
  parentData: {
    type: String as PropType<any>,
    default: '' as String
  },
  treeIndex: {
    type: Number as PropType<any>,
    default: 0 as Number
  }
})
</script>

<template>
  <view>
    <view v-for="(item, index) in props.treeData" :key="index">
      <TreeSon :treeData="item" :treeIndex="props.treeIndex" :employeeList="item.employeeList" />
    </view>
  </view>
</template>
<style lang="less" scoped>
::v-deep .van-tag--default {
  padding: 10rpx;
}
.van-tag {
  padding: 10rpx;
}
</style>
