<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useEmitt } from '@/hooks/useEmitt'

import chatItem from './chatItem.vue'

const props = defineProps({
  recvId: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  }
})
//聊天内容
const chatList = ref([] as any)

//显示
const isShow = ref<boolean>(false)
//加载
const loadMore = ref<string>('loadmore')
const lowerLoadMore = ref<string>('loadmore')
//滚动条 滚动位置
const scrollTop = ref(0)
const scrollIntoView = ref('')

//是否展示时间
const showTime = (index: number): boolean => {
  // if (index === 0) {
  //   return true
  // }
  // if (index > 0) {
  //   const timeDifference =
  //     useStore.chatList[index].createTime! - useStore.chatList[index - 1].createTime!
  //   if (Math.abs(timeDifference) > 5 * 60 * 1000) {
  //     return true
  //   }
  // }
  return false
}

//滚动到指定位置
const scrollToIndex = async (index: number) => {
  // const id = useStore.chatList[index]?.clientMsgID
  // nextTick(() => {
  //   scrollIntoView.value = 'item_' + id
  // })
}

//获取历史消息
const getHistoryMessageListData = async (isScrollToUpper = false) => {
  console.log('获取历史消息', isScrollToUpper)
}

//反向获取历史消息
const getHistoryMessageListReverseData = async () => {
  console.log('反向获取历史消息')
}

//下拉加载历史消息
const scrollToUpper = async () => {
  if (loadMore.value === 'loadmore' && lowerLoadMore.value != 'loading') {
    loadMore.value = 'loading'
    //加载消息
    getHistoryMessageListData(true)
  }
}

//上拉加载新的消息
const scrolltolower = async () => {
  if (lowerLoadMore.value === 'loadmore' && loadMore.value != 'loading') {
    lowerLoadMore.value = 'loading'
    //加载消息
    getHistoryMessageListReverseData()
  }
}

//滚到底部通知
useEmitt({
  name: 'Messages:setScrollToBottom',
  callback: () => {
    scrollIntoView.value = ''
    setTimeout(() => {
      // scrollToIndex(useStore.chatList.length - 1)
    }, 100)
  }
})

//释放
onUnmounted(() => {})
</script>

<template>
  <scroll-view
    v-show="isShow"
    :scroll-into-view="scrollIntoView"
    @scrolltoupper="scrollToUpper"
    :upper-threshold="50"
    @scrolltolower="scrolltolower"
    :lower-threshold="50"
    :scroll-y="true"
    :scroll-top="scrollTop"
  >
    <!-- 状态 -->
    <u-loadmore
      loadmore-text="下拉加载历史消息"
      loading-text="正在加载..."
      nomore-text="没有更多历史消息了"
      :status="loadMore"
    />
    <view
      class="item"
      :id="'item_' + item.clientMsgID"
      :key="item.clientMsgID"
      v-for="(item, index) in chatList"
    >
      <chat-item
        :showTime="showTime(index)"
        :recvId="props.recvId"
        :title="props.title"
        :item="item"
      />
    </view>
    <u-loadmore
      v-if="lowerLoadMore == 'loading'"
      loadmore-text="上拉加载消息"
      loading-text="正在加载..."
      nomore-text="没有更多消息了"
      :status="lowerLoadMore"
    />
  </scroll-view>
</template>

<style lang="scss" scoped>
scroll-view {
  height: 100%;
  background-color: #ededed;
  box-sizing: border-box;
  overflow: hidden;
  max-height: fit-content;
  transition: height 0.2s ease-out;
  padding-bottom: 20rpx;
}

.item {
  width: 100vw;
  margin-bottom: 20rpx;
}
</style>
