<script setup lang="ts">
import type { PropType } from 'vue'
import { getChatTime } from '@/utils'
import ImageText from './components/image-text.vue'
import { useEmitt } from '@/hooks/useEmitt'

const props = defineProps({
  item: {
    // 页码
    type: Object as PropType<any>,
    // eslint-disable-next-line vue/require-valid-default-prop
    default: {}
  },
  //当前聊天用户
  recvId: {
    type: String,
    default: () => ''
  },
  //当前聊天用户名
  title: {
    type: String,
    default: ''
  },
  //是否组聊天
  groupFlag: {
    type: Boolean,
    default: false
  },
  showTime: {
    type: Boolean,
    default: false
  },
  // eslint-disable-next-line vue/prop-name-casing
  Audio: {
    type: Object as PropType<UniApp.InnerAudioContext>
  }
})

const { emitter } = useEmitt()

//是否他人消息
const leftFlag = (item: any): boolean => {
  if (item.sendID == props.recvId) {
    return true
  }
  return false
}

const contentReplace = (content: string): string => {
  return content //content.replace(/<(\/)?pre[^>]*>/gi, '')
}

const revokeText = (): string => {
  let text = leftFlag(props.item) ? props.title : '你'
  return text + '撤回了一条消息'
}

const isTest = () => {
  return props.item.seq === 0 && props.item.content?.indexOf('{\\"') === -1
}

//重新编辑
const reeditClick = () => {
  emitter.emit('Comment:reedit', props.item.content)
}

const longpress = () => {
  if (leftFlag(props.item) || !props.item.createTime) return
  if (Date.now() - props.item.createTime > 2 * 60 * 1000) return
  uni.showModal({
    title: '撤销提示',
    content: '是否撤销该消息?',
    success: async function (ress: any) {
      // if (ress.confirm) {
      //   const data = JSON.stringify(props.item)
      //   revokeMessage(data, (cRes: any) => {
      //     if (cRes && cRes.errCode == 0) {
      //       const temp = JSON.parse(data) as IChatMessage
      //       temp.contentType = 111
      //       updateConversation(temp)
      //     } else {
      //       setTimeout(() => {
      //         uni.showToast({ title: '撤销消息失败！', icon: 'error' })
      //       }, 300)
      //     }
      //   })
      // }
    }
  })
}
</script>

<template>
  <view class="chat-time" v-if="showTime">
    <text>{{ getChatTime(item.createTime ?? 0) }}</text>
  </view>
  <view class="chat-revoke" v-if="item.contentType === 111">
    <text>{{ revokeText() }}</text>
    <text v-if="isTest()" class="!text-#196CFF" @tap.stop="reeditClick">重新编辑</text>
  </view>

  <view
    class="chat-image-body"
    :class="leftFlag(item) ? 'chat-left' : 'chat-right'"
    @longpress="longpress"
    v-else-if="item.contentType === 102"
  >
    <view class="chat-header mx-20rpx">
      <image class="message-avatar" :src="item.senderFaceUrl" />
    </view>
    <view class="msg">
      <image-text :item="item" />
    </view>
    <view class="readType ml-20rpx">
      <view v-if="item.status === 3">
        <van-icon name="warning" size="30rpx" color="#FB5255" />
      </view>
      <view v-else-if="item.status === 1">
        <u-loading-icon color="#196CFF" size="30rpx" />
      </view>
    </view>
  </view>

  <view
    v-else
    class="chat-body"
    :class="leftFlag(item) ? 'chat-left' : 'chat-right'"
    @longpress="longpress"
  >
    <view class="chat-header">
      <image class="message-avatar" :src="item.senderFaceUrl" />
    </view>
    <view class="box" :class="leftFlag(item) ? 'left' : 'right'" />
    <view class="msg">
      <rich-text
        style="
          line-height: 44rpx;
          letter-spacing: 3rpx;
          word-break: break-all;
          white-space: pre-line;
        "
        v-if="item.contentType === 101"
        :nodes="contentReplace(item.content ?? '')"
      />
      <audio-text
        v-if="item.contentType === 103"
        :Audio="Audio"
        :item="item"
        :leftFlag="leftFlag(item)"
      />
    </view>
    <view class="readType">
      <view v-if="item.status === 3" class="mr-20rpx">
        <van-icon name="warning" size="30rpx" color="#FB5255" />
      </view>
      <view v-else-if="item.status === 1" class="mr-20rpx">
        <u-loading-icon color="#196CFF" size="30rpx" />
      </view>
      <text class="font-size-four text-#999999" v-else-if="!leftFlag(item) && !item.isRead">
        未读
      </text>
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

  view.readType {
    margin-right: 10rpx;
    color: #b07474;
    display: flex;
    align-items: center;
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
