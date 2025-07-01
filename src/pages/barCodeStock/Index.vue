<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import ContentStorage from './components/ContentStorage.vue'

//条码库存查询
const reacticeData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '库存查询',
  FEntity: [] as any //单据提交
})

const contentStorageRef = ref() //标题组件引用
</script>
<template>
  <view>
    <HeadStorage :title="reacticeData.title" />
  </view>
  <scroll-view scroll-y style="height: calc(100vh - 44px - 24px)">
    <view>
      <ContentStorage ref="contentStorageRef" />
    </view>
  </scroll-view>
</template>
<style lang="less" scoped></style>
