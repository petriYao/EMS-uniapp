<script setup lang="ts">
import { reactive, ref, onBeforeUnmount, onBeforeMount, watch } from 'vue'
import HeadStorage from './components/HeadStorage.vue'
import ContentStorage from './components/ContentStorage.vue'
import SanContentStorage from './sanComponents/SanContentStorage.vue'
import { useEmitt } from '@/hooks/useEmitt'
import { throttleSave } from '@/utils'

//采购入库单
const reactiveData = reactive({
  isShow: true, //是否选择
  loading: false, //是否保存
  title: '采购入库',
  FEntity: [] as any, //单据提交
  scanCodeType: ''
})

const contentStorageRef = ref() //标题组件引用
const sanContentStorageRef = ref()

const saveClick = throttleSave(async () => {
  if (reactiveData.scanCodeType == '扫单入库') {
    sanContentStorageRef.value?.saveClick()
  } else {
    contentStorageRef.value?.saveClick()
  }
})
const hideTimer = ref<number | null>(null)
const handleFocus = () => {
  // 清除之前的定时器（如果存在）
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
  }

  // 设置新的定时器
  hideTimer.value = setInterval(() => {
    uni.hideKeyboard()
  }, 50) as unknown as number
}

const clearTimer = () => {
  // 清除定时器
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    hideTimer.value = null
  }
}
useEmitt({
  name: 'update:handleFocus',
  callback: async () => {
    console.log('设置定时器')
    handleFocus()
  }
})
useEmitt({
  name: 'update:clearTimer',
  callback: async () => {
    clearTimer()
  }
})

watch(
  () => reactiveData.scanCodeType,
  (val: any) => {
    console.log('val', val)
    handleFocus()
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  // 组件卸载时清理
  clearTimer()
})
</script>
<template>
  <view>
    <HeadStorage :title="reactiveData.title" v-model:scanCodeType="reactiveData.scanCodeType" />
  </view>
  <scroll-view scroll-y style="height: calc(100vh - 40px - 44px - 24px)">
    <view v-if="reactiveData.scanCodeType == '扫码入库'">
      <ContentStorage ref="contentStorageRef" />
    </view>
    <view v-if="reactiveData.scanCodeType == '扫单入库'">
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
