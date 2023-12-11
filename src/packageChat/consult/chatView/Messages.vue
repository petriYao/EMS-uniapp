<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeMount } from 'vue'
import { useChatStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'
import { getUserIdentity } from '@/hooks/useCache'
import { getSvgURL } from '@/utils'
import { ReplyList } from '@/api'
import { IChatParams, IChatMessage } from '@/types/chatModel'

import ChatItem from './chatItem.vue'

const useStore = useChatStore()

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

const setData = reactive({
  replyId: 0,
  replyType: props.title === '房源咨询' ? 2 : 1,
  size: 12
} as IChatParams)

//自己的头像
const myAvatar = ref('')

//显示
const isShow = ref<boolean>(true)
//加载
const loadMore = ref<string>('loadmore')
const lowerLoadMore = ref<string>('loadmore')
//滚动条 滚动位置
const scrollTop = ref(0)
const scrollIntoView = ref('')

//是否展示时间
const showTime = (index: number): boolean => {
  if (index === 0) {
    return true
  }
  if (index > 0) {
    const timeDifference =
      new Date(useStore.chatList[index].replyTime).getTime() -
      new Date(useStore.chatList[index - 1].replyTime).getTime()
    if (Math.abs(timeDifference) > 5 * 60 * 1000) {
      return true
    }
  }
  return false
}

//滚动到指定位置
const scrollToIndex = async (index: number) => {
  const id = useStore.chatList[index]?.replyId
  nextTick(() => {
    scrollIntoView.value = 'item_' + id
  })
}

//获取历史消息
const getHistoryMessageListData = async (isScrollToUpper = false) => {
  console.log('获取历史消息', isScrollToUpper)
  if (useStore.chatList.length > 0) {
    setData.replyId = useStore.chatList[0].replyId
  }
  const res = await ReplyList({ ...setData, order: 0 })
  if (res && res.success) {
    const list = (res.value.list ?? []) as IChatMessage[]
    if (list.length > 0) {
      for (const item of list) {
        useStore.chatList.unshift(item)
      }
      //设置滚动条位置
      if (isScrollToUpper) {
        scrollIntoView.value = 'item_' + list[0].replyId
      } else {
        setTimeout(() => {
          if (scrollTop.value == 99999) scrollTop.value = 99998
          else scrollTop.value = 99999
          isShow.value = true
        }, 300)
      }
      //设置状态
      loadMore.value = 'loadmore'
    } else {
      loadMore.value = 'nomore'
      isShow.value = true
    }
  }
}

const getNewMessageListData = async () => {
  if (useStore.chatList.length > 0) {
    setData.replyId = useStore.chatList[useStore.chatList.length - 1].replyId
  }
  const res = await ReplyList({ ...setData, order: 1 })
  if (res && res.success && res.value.list) {
    const list = res.value.list ?? []
    useStore.chatList.push(...list)
    setTimeout(() => {
      if (scrollTop.value == 99999) scrollTop.value = 99998
      else scrollTop.value = 99999
    }, 300)
  }
  lowerLoadMore.value = 'loadmore'
}

//下拉加载历史消息
const scrollToUpper = async () => {
  console.log('scrollToUpper', loadMore.value, lowerLoadMore.value)
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
    await getNewMessageListData()
  }
}

//更新定时器
const setNewMessageListTime = () => {
  setTimeout(async () => {
    await scrolltolower()
    setNewMessageListTime()
  }, 5000)
}

//滚到底部通知
useEmitt({
  name: 'Messages:setScrollToBottom',
  callback: () => {
    console.log('滚到底部通知')
    scrollIntoView.value = ''
    setTimeout(() => {
      scrollToIndex(useStore.chatList.length - 1)
    }, 100)
  }
})

//发送成功更新
useEmitt({
  name: 'update:chatList',
  callback: () => {
    getNewMessageListData()
  }
})

onBeforeMount(() => {
  const identity = getUserIdentity()
  if (!identity || !identity.userInfo) return
  myAvatar.value = getUserIdentity().userInfo?.avatarImage?.listUrl
  useStore.chatList = []
  getHistoryMessageListData()
  setNewMessageListTime()
})
</script>

<template>
  <view class="h-[inherit]" v-if="isShow">
    <scroll-view
      :scroll-into-view="scrollIntoView"
      @scrolltoupper="scrollToUpper"
      :upper-threshold="50"
      @scrolltolower="scrolltolower"
      :lower-threshold="50"
      :scroll-y="true"
      :scroll-top="scrollTop"
    >
      <!-- 状态 -->
      <view class="h-1px" />
      <u-loadmore
        loadmore-text="下拉加载历史消息"
        loading-text="正在加载..."
        nomore-text="没有更多历史消息了"
        :status="loadMore"
      />
      <view
        class="item"
        v-for="(item, index) in useStore.chatList"
        :id="'item_' + item.replyId"
        :key="item.replyId"
      >
        <ChatItem
          :showTime="showTime(index)"
          :item="item"
          :avatar="item.isMy === 1 ? myAvatar : getSvgURL('home', 'home-keyword')"
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
  </view>
</template>

<style lang="scss" scoped>
scroll-view {
  height: 100%;
  background-color: #ededed;
  box-sizing: border-box;
  overflow: hidden;
  max-height: fit-content;
  transition: height 0.2s ease-out;
  // padding-bottom: 20rpx;
}

.item {
  width: 100vw;
  margin-bottom: 20rpx;
}
</style>
