<script setup lang="ts">
import { reactive, ref } from 'vue'
import HeadStorage from '../components/HeadStorage.vue'
import ContentStorage from './components/ContentStorage.vue'
import SanContentStorage from './components/SanContentStorage.vue'

import { debounceSave } from '@/utils'

//委外退料单
const reactiveData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '委外退料',
  FEntity: [] as any, //单据提交
  scanCodeType: ''
})

const contentStorageRef = ref() //标题组件引用
const sanContentStorageRef = ref()

const saveClick = debounceSave(async () => {
  if (reactiveData.scanCodeType == '扫单退料') {
    sanContentStorageRef.value?.saveClick()
  } else {
    contentStorageRef.value?.saveClick()
  }
})
</script>
<template>
  <view>
    <HeadStorage :title="reactiveData.title" v-model:scanCodeType="reactiveData.scanCodeType" />
  </view>
  <scroll-view scroll-y style="height: calc(100vh - 40px - 44px - 24px)">
    <view v-if="reactiveData.scanCodeType == '单码双扫'">
      <ContentStorage ref="contentStorageRef" />
    </view>
    <view v-if="reactiveData.scanCodeType == '扫单退料'">
      <SanContentStorage ref="sanContentStorageRef" />
    </view>
  </scroll-view>
  <view class="h-40px">
    <view>
      <view
        class="bg-#56a8fe text-#FFF w-100% h-40px flex justify-center items-center"
        @click="saveClick"
      >
        提交
      </view>
    </view>
  </view>
</template>
<style lang="less" scoped></style>
