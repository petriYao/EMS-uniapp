<script setup lang="ts">
import { PropType } from 'vue'
import { IChatAudio, PlayCodeEnum } from '@/types/chatModel'
import { useChatStore } from '@/store'
import { getSvgURL } from '@/utils'

const useStore = useChatStore()

const props = defineProps({
  item: {
    type: Object as PropType<any>,
    default: {} as any
  },
  leftFlag: {
    //是否左边消息
    type: Boolean,
    default: true
  },
  // eslint-disable-next-line vue/prop-name-casing
  Audio: {
    type: Object as PropType<UniApp.InnerAudioContext>
  }
})

//消息
const msg = props.item.replyContent.voice as IChatAudio

//播放声音
const handleAudio = () => {
  const inPlay = props.item.anmitionPlay
  stopAudio()
  if (
    !useStore.currentAudio ||
    useStore.currentAudio.clientMsgID != props.item.clientMsgID ||
    (useStore.currentAudio.clientMsgID == props.item.clientMsgID && !inPlay)
  ) {
    useStore.currentAudio = props.item
    playAudio()
  }
}

//播放音频
const playAudio = () => {
  if (!useStore.currentAudio?.soundElem) return
  useStore.currentAudio.anmitionPlay = PlayCodeEnum.loading
  props.Audio!.src = useStore.currentAudio.soundElem?.sourceUrl
  props.Audio!.play()
}

//停止音频
const stopAudio = () => {
  if (useStore.currentAudio && useStore.currentAudio.anmitionPlay) {
    useStore.currentAudio.anmitionPlay = PlayCodeEnum.inactive
    props.Audio!.src = ''
    props.Audio!.stop()
  }
}
</script>

<template>
  <view
    class="voiceBody"
    :class="!leftFlag ? 'voiceItemRight' : ''"
    @tap="handleAudio"
    :style="{ width: `${80 + msg.duration * 5}rpx` }"
  >
    <view v-if="leftFlag">
      <view class="rotate-90 mr-4rpx">
        <u-loading-icon
          v-if="item.anmitionPlay === PlayCodeEnum.loading"
          color="#272626"
          size="30rpx"
        />
        <u-icon
          v-else-if="item.anmitionPlay === PlayCodeEnum.active"
          :name="getSvgURL('chat', 'wifiBlack')"
          size="20"
          color="#272626"
        />
        <u-icon v-else name="wifi" size="20" color="#272626" />
      </view>
    </view>
    <view class="">{{ msg.duration }}"</view>
    <view v-if="!leftFlag">
      <view class="rotate-270 ml-4rpx">
        <u-loading-icon
          v-if="item.anmitionPlay === PlayCodeEnum.loading"
          color="#196CFF"
          size="30rpx"
        />
        <u-icon
          v-else-if="item.anmitionPlay === PlayCodeEnum.active"
          :name="getSvgURL('chat', 'wifiWhite')"
          size="20"
          currentColor="#FFF"
        />
        <u-icon v-else name="wifi" size="20" color="#FFF" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.voiceBody {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.voiceItemRight {
  justify-content: flex-end;
}
</style>
../../store
