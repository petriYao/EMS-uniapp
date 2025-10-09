<script setup lang="ts">
import { ref, onBeforeUnmount, onBeforeMount } from 'vue'
import { getcamelCase } from '@/common/inventory/Inventory'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  scanCodeType: {
    type: String,
    default: ''
  }
})

// 数据定义
const searchValue = ref<string>('')
const focus = ref<number>(99)
const fid = ref<number>(0)
const detailsList = ref<any[]>([])

// 事件定义
const emit = defineEmits<{
  (e: 'update:detailsList', modelValue: any): void
  (e: 'update:fid', modelValue: any): void
  (e: 'update:locationList', modelValue: any): void
}>()

const searchInput = ref()

// 扫码逻辑
const searchClick = async () => {
  const res: any = await uni.scanCode({
    scanType: ['barCode', 'qrCode'],
    onlyFromCamera: true
  })
  if (res) {
    searchValue.value = res.result
    searchChange()
  }
}

// 搜索变化处理
const searchChange = () => {
  setTimeout(async () => {
    if (!searchValue.value) return
    handleFocus()

    const queryRes: any = await getcamelCase(searchValue.value, props.scanCodeType)
    if (!queryRes?.dataList?.length) {
      // showToast('未找到相关单据')
      searchValue.value = ''
      resetFocus()
      return
    }
    detailsList.value = queryRes.dataList
    fid.value = queryRes.fid
    emit('update:detailsList', detailsList.value)
    emit('update:fid', fid.value)

    searchValue.value = ''
    resetFocus()
  }, 500)
}

// 重置焦点
const resetFocus = () => {
  focus.value = 0
  setTimeout(() => {
    focus.value = 99
  }, 200)
}

// 键盘控制
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
  if (hideTimer.value) {
    clearInterval(hideTimer.value)
    hideTimer.value = null
  }
}

useEmitt({
  name: 'update:clearTimer',
  callback: async () => {
    clearTimer()
  }
})

onBeforeUnmount(() => {
  clearTimer()
})

onBeforeMount(() => {
  handleFocus()
  resetFocus()
})
</script>

<template>
  <view>
    <!-- 订单号搜索 -->
    <view class="flex items-center pb-20rpx bg-#f2f2f2">
      <view class="w-50px flex justify-center" @click="searchClick">
        <u-icon name="scan" size="24" />
      </view>
      <view class="flex-1 mr-20rpx" style="border: 1px solid #f8f8f8" @click="clearTimer">
        <u-input
          ref="searchInput"
          v-model="searchValue"
          :showAction="false"
          customStyle="background: #FFF;"
          shape="round"
          placeholder="请输入搜索关键词"
          :focus="focus === 99"
          @blur="searchChange"
        />
      </view>
    </view>
  </view>
</template>
<style lang="scss" scoped></style>
