<script setup lang="ts">
import { ref, nextTick, onBeforeMount, onUnmounted } from 'vue'
import { useChatStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'
import { getUserIdentity } from '@/hooks/useCache'
import { getImageURL } from '@/utils'
import { getReplyList } from '@/api'
import { IChatParams, IChatMessage, PlayCodeEnum } from '@/types/chatModel'

import ChatItem from './chatItem.vue'

const useStore = useChatStore()

const props = defineProps({
  replyType: {
    type: Number,
    default: 1
  }
})

//自己的头像
const myAvatar = ref('')
//定时器
const newReplyInterval = ref(null as any)
//显示
const isShow = ref<boolean>(false)
//加载
const loadMore = ref<string>('loadmore')
const lowerLoadMore = ref<string>('loadmore')
//滚动条 滚动位置
const scrollTop = ref(0)
const scrollIntoView = ref('')

//关闭音频播放
const closeAudioAnmition = () => {
  if (useStore.currentAudio && useStore.currentAudio.anmitionPlay) {
    useStore.currentAudio.anmitionPlay = PlayCodeEnum.inactive
  }
}

//播放音频
// 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
const innerAudioContext = uni.createInnerAudioContext()

//监听音频播放进度更新事件
innerAudioContext.onTimeUpdate(() => {
  if (useStore.currentAudio) {
    useStore.currentAudio.anmitionPlay = PlayCodeEnum.active
  }
})

//监听音频播放结束
innerAudioContext.onEnded(() => {
  closeAudioAnmition()
})

//监听音频播放错误
innerAudioContext.onError(() => {
  closeAudioAnmition()
})

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
  const data = {
    replyType: props.replyType,
    order: 0,
    size: 12,
    replyId: 0
  } as IChatParams
  if (useStore.chatList.length > 0) {
    data.replyId = useStore.chatList[0].replyId
  }
  const res = await getReplyList(data)
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
  return res
}

const getNewMessageListData = async () => {
  const data = {
    replyType: props.replyType,
    order: 1,
    size: 12,
    replyId: 0
  } as IChatParams
  if (useStore.chatList.length > 0) {
    data.replyId = useStore.chatList[useStore.chatList.length - 1].replyId
  }
  const res = await getReplyList(data)
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

const initData = async () => {
  useStore.chatList = []
  const identity = getUserIdentity()
  if (!identity || !identity.userInfo) return
  myAvatar.value = getUserIdentity().userInfo?.avatarImage?.listUrl
  const res = await getHistoryMessageListData()
  if (res.success) {
    setNewMessageListTime()
  }
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
    await getNewMessageListData()
  }
}

//更新定时器
const setNewMessageListTime = () => {
  const identity = getUserIdentity()
  if (!identity || !identity.userInfo) return
  if (newReplyInterval.value) return
  newReplyInterval.value = setInterval(async () => {
    await scrolltolower()
  }, 10000)
}

//滚到底部通知
useEmitt({
  name: 'Messages:setScrollToBottom',
  callback: () => {
    scrollIntoView.value = ''
    setTimeout(() => {
      scrollToIndex(useStore.chatList.length - 1)
    }, 100)
  }
})

//发送成功更新
useEmitt({
  name: 'Messages:getNewData',
  callback: () => {
    getNewMessageListData()
  }
})

useEmitt({
  name: 'Messages:initData',
  callback: () => {
    useStore.chatList = []
    initData()
  }
})

onBeforeMount(() => {
  initData()
})

//释放
onUnmounted(() => {
  innerAudioContext.destroy()
  useStore.chatList = []
  if (newReplyInterval.value) {
    clearInterval(newReplyInterval.value)
  }
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
      <view v-if="useStore.chatList.length >= 12">
        <u-loadmore
          loadmore-text="下拉加载历史消息"
          loading-text="正在加载..."
          nomore-text="没有更多历史消息了"
          :status="loadMore"
        />
      </view>
      <view
        class="item"
        v-for="(item, index) in useStore.chatList"
        :id="'item_' + item.replyId"
        :key="item.replyId"
      >
        <ChatItem
          :showTime="showTime(index)"
          :item="item"
          :avatar="item.isMy === 1 ? myAvatar : getImageURL('home', 'home-keyword')"
          :Audio="innerAudioContext"
        />
      </view>
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
