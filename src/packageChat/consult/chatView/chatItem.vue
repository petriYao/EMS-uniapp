<script setup lang="ts">
import type { PropType } from 'vue'
import { getChatTime } from '@/utils'
import { useEmitt } from '@/hooks/useEmitt'
import { IChatMessage } from '@/types/chatModel'

import ImageText from './components/image-text.vue'
import AudioText from './components/audio-text.vue'

const props = defineProps({
  item: {
    // 页码
    type: Object as PropType<IChatMessage>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: {}
  },

  showTime: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: ''
  },
  // eslint-disable-next-line vue/prop-name-casing
  Audio: {
    type: Object as PropType<UniApp.InnerAudioContext>
  }
})

const { emitter } = useEmitt()

//是否他人消息
const leftFlag = (item: any): boolean => {
  if (item.isMy == 1) {
    return false
  }
  return true
}

const contentReplace = (content: string): string => {
  return content //content.replace(/<(\/)?pre[^>]*>/gi, '')
}

const revokeText = (): string => {
  let text = leftFlag(props.item) ? '对方' : '你'
  return text + '撤回了一条消息'
}

const isTest = () => {
  return props.item.replyContent.text?.length > 0
}

//重新编辑
const reeditClick = () => {
  emitter.emit('Comment:reedit', props.item.replyContent.text)
}

// 消息撤回
const longpress = () => {
  if (leftFlag(props.item) || !props.item.replyTime) return
  const now = new Date()
  if (now.getTime() - new Date(props.item.replyTime).getTime() > 2 * 60 * 1000) return
  uni.showModal({
    title: '撤销提示',
    content: '是否撤销该消息?',
    success: async function (_ress: any) {}
  })
}
</script>

<template>
  <view class="chat-time" v-if="showTime">
    <text>{{ getChatTime(item.replyTime ? new Date(item.replyTime).getTime() : 0) }}</text>
  </view>

  <!-- 撤回消息 -->
  <view class="chat-revoke" v-if="item.contentType === 111">
    <text>{{ revokeText() }}</text>
    <text v-if="isTest()" class="!text-#196CFF" @tap.stop="reeditClick">重新编辑</text>
  </view>

  <view
    class="chat-image-body"
    :class="leftFlag(item) ? 'chat-left' : 'chat-right'"
    @longpress="longpress"
    v-else-if="item.replyContent.image"
  >
    <view class="chat-header mx-20rpx">
      <image class="message-avatar" :src="props.avatar" />
    </view>
    <view class="msg">
      <ImageText :item="item" />
    </view>
  </view>

  <view
    v-else
    class="chat-body"
    :class="leftFlag(item) ? 'chat-left' : 'chat-right'"
    @longpress="longpress"
  >
    <view class="chat-header">
      <image class="message-avatar" :src="props.avatar" />
    </view>
    <view class="box" :class="leftFlag(item) ? 'left' : 'right'" />
    <view class="msg">
      <rich-text
        v-if="item.replyContent.text"
        style="
          line-height: 44rpx;
          letter-spacing: 3rpx;
          word-break: break-all;
          white-space: pre-line;
        "
        :nodes="contentReplace(item.replyContent.text ?? '')"
      />
      <AudioText
        v-if="item.replyContent.voice"
        :Audio="Audio"
        :item="item"
        :leftFlag="leftFlag(item)"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
$leftColor: #fff;
$leftText: #272626;
$rightColor: #196cff;
$rightText: #fff;

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20px;
}

view.chat-time {
  text-align: center;
  margin-bottom: 30rpx;

  text {
    color: #888888;
    padding: 5rpx 15rpx 5rpx 15rpx;
    border-radius: 15rpx;
    font-size: var(--font-size-four);
  }
}

view.chat-revoke {
  text-align: center;
  margin-bottom: 10rpx;
  padding-bottom: 20rpx;
  text {
    padding: 5rpx 15rpx 5rpx 15rpx;
    color: #a3a3a3;
    font-size: var(--font-size-four);
  }
}

.chat-image-body {
  display: flex;

  &.chat-left {
    margin-left: 15rpx;
  }

  &.chat-right {
    flex-direction: row-reverse;
    margin-right: 15rpx;
  }
}
view.chat-body {
  display: flex;
  justify-content: flex-start;
  // align-items: center;

  .box {
    width: 0px;
    height: 0px;
    border-width: 10rpx;
    border-style: solid;
    margin-top: 30rpx;

    &.left {
      border-top-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
    }

    &.right {
      border-top-color: transparent;
      border-right-color: transparent;
      border-bottom-color: transparent;
    }
  }

  .msg {
    min-height: 60rpx;
    max-width: 480rpx;
    font-size: var(--font-size-seven);
    line-height: 30rpx;
    padding: 10rpx 20rpx;
    display: flex;
    align-items: center;
    border-radius: 20rpx;

    image {
      min-width: 250rpx;
      max-width: 100%;
    }
  }

  view.chat-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    color: #3f536e;

    & > view {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130rpx;
      height: 30rpx;
      font-size: var(--font-size-four);
      line-height: 30rpx;
    }
  }

  &.chat-left {
    color: $leftText;
    margin-left: 15rpx;

    & > .msg {
      background: $leftColor;
    }

    & > .box {
      border-right-color: $leftColor;
    }
  }

  &.chat-right {
    flex-direction: row-reverse;
    margin-right: 15rpx;

    & > .msg {
      background: $rightColor;
      color: $rightText;
      word-break: break-all;
    }

    & > .box {
      border-left-color: $rightColor;
    }
  }

  view.chat-content {
    background: #007aff;
    max-width: 80vw;
  }
}
</style>
../components/util../components/video-text.vue../components/audio-text.vue../components/image-text.vue
