<script setup lang="ts">
import { reactive, computed, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

import { useBackTopStore, useModalStore } from '@/store'
import router from '@/router'

import BackTop from '@/components/backTop/index.vue'

const props = defineProps({
  enableBackTop: {
    type: Boolean,
    default: false
  }
})

const useModal = useModalStore()
const useBackTop = useBackTopStore()

const modalData = computed(() => useModal.modalData)

const modalConf = computed(() => {
  const showConfirmButton = useModal.modalData.type == 1 || useModal.modalData.type == 2
  const showCancelButton = useModal.modalData.type == 2
  const closeOnClickOverlay = useModal.modalData.type == 1
  return { showConfirmButton, showCancelButton, closeOnClickOverlay }
})

//新的值
const reactiveData = reactive({
  recordKey: Date.now().toString()
})
//添加记录
useBackTop.addBackTopRecord(reactiveData.recordKey)

//关闭
const close = () => {
  useModal.clearData()
}

//确认
const confirm = () => {
  const isBind = useModal.modalData.type === 2 && useModal.modalData.title === '未绑定' ? 1 : 0
  close()
  if (useModal.modalData.type === 2) {
    router.push({
      url: `/packageLogin/login/Login?isBind=${isBind}`
    })
  }
}

//置顶
const setScrollTop = () => {
  if (useBackTop.recordMap[reactiveData.recordKey].backTopAttrs.isScrollView) {
    useBackTop.recordMap[reactiveData.recordKey].setScrollTop()
  } else {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  }
}

onShow(() => {
  useBackTop.recordKey = reactiveData.recordKey
})

onUnmounted(() => {
  delete useBackTop.recordMap[reactiveData.recordKey]
})
</script>

<template>
  <BackTop
    v-if="props.enableBackTop"
    :backTopAttrs="useBackTop.recordMap[reactiveData.recordKey].backTopAttrs"
    :scrollHeight="useBackTop.recordMap[reactiveData.recordKey].scrollHeight"
    @set-scroll-top="setScrollTop"
  />
  <u-popup
    mode="center"
    :closeOnClickOverlay="modalConf.closeOnClickOverlay"
    :show="modalData.show"
    :overlayOpacity="modalData.type == 0 ? 0 : 0.5"
    @close="close"
    customStyle="border-radius: 20rpx;background-color: transparent;"
  >
    <view v-if="modalData.show">
      <view v-if="modalData.type == 0">
        <u-loading-icon :title="modalData.title" color="#196CFF" size="60rpx" />
      </view>
      <view v-else class="rounded-20rpx box-border px-20rpx bg-#FFF text-32rpx w-90vw">
        <view class="pt-30rpx text-center text-34rpx font-bold">{{ modalData.title }}</view>
        <scroll-view scroll-y class="min-h-200rpx max-h-800rpx">
          <view
            class="text-#999999 py-30rpx flex items-center justify-center min-h-100rpx w-100% min-w-450rpx"
          >
            <text class="max-w-560rpx" style="word-wrap: break-word; white-space: normal">{{
              modalData.content
            }}</text>
          </view>
        </scroll-view>

        <view class="flex py-20rpx" style="border-top: 1rpx solid #f3efef">
          <view
            class="text-center text-#999999 w-50%"
            style="border-right: 1rpx solid #f3efef"
            v-if="modalConf.showCancelButton"
            @click="close"
          >
            取消
          </view>

          <view
            class="text-center text-#196CFF flex-1"
            v-if="modalConf.showConfirmButton"
            @click="confirm"
          >
            确定
          </view>
        </view>
      </view>
    </view>
  </u-popup>
  <slot></slot>
</template>
