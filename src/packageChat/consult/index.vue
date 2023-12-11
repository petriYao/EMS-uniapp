<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

import { useAppStore, useChatStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'
import { debounce, getSvgURL } from '@/utils'
import router from '@/router'

import Messages from './chatView/Messages.vue'
import Comment from './chatView/Comment.vue'

const { emitter } = useEmitt()
const appStore = useAppStore()
const chatStore = useChatStore()

const marginHeight = ref(appStore.notchHeight + 'px')

//显示
const isShow = ref<boolean>(false)
// 轮播图
const title = ref('')

//消息显示高度
const subMessagesHeight = ref(0)

//计算高度
const getHeight = (panelHeight: number) => {
  return appStore.navbarHeight + panelHeight + chatStore.automaticHeight
}

//更新高度
const updateHeight = (panelHeight: number) => {
  console.log('更新高度1', subMessagesHeight.value)
  subMessagesHeight.value = getHeight(panelHeight)
  if (panelHeight > chatStore.defCommentHeight) {
    emitter.emit('Messages:setScrollToBottom')
  }
}

//防抖更新高度
const updateHeightDebounce = debounce((panelHeight) => {
  console.log('防抖更新高度')
  updateHeight(panelHeight)
}, 100)

//点击收起
const messagesClick = () => {
  emitter.emit('Comment:closePanel')
}

//返回上一页
const leftClick = () => {
  router.back()
}

useEmitt({
  name: 'MChat:updateHeight',
  callback: (panelHeight: number) => {
    console.log('updateHeight', panelHeight)
    updateHeightDebounce(panelHeight)
  }
})

onBeforeMount(() => {
  //初始化高度
  chatStore.initHeight()
  //更新高度
  updateHeight(chatStore.commentHeight)
})

onLoad(async (val: any) => {
  if (val.title) {
    title.value = val.title
  }
})

onShow(() => {
  if (isShow.value) {
    emitter.emit('Messages:initData')
    emitter.emit('Comment:getAutomaticList')
  }
  isShow.value = true
})
</script>

<template>
  <ContentWrap>
    <!-- 头部开始 -->
    <view
      class="h-44px flex items-center bg-[#EDEDED] px-20rpx"
      :style="`padding-top:${marginHeight}`"
    >
      <view class="mr-10rpx" @click="leftClick"><u-icon name="arrow-left" size="34rpx" /></view>
      <view class="mr-10rpx">
        <u-icon :name="getSvgURL('home', 'home-keyword')" size="60rpx" />
      </view>
      <view>{{ title }}</view>
    </view>
    <!-- 头部结束 -->
    <!-- 内容 -->
    <view @tap="messagesClick" class="bg-#f4f5f7 flex flex-col justify-between">
      <Messages
        :title="title"
        :style="`height: calc(100vh - ${subMessagesHeight}px);padding-bottom: 0;`"
      />
    </view>
    <!-- 底部 -->
    <Comment :title="title" />
  </ContentWrap>
</template>

<style lang="scss" scoped>
::v-deep .u-textarea {
  padding: 0px 9px !important;
}
</style>
