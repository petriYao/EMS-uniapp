<script setup lang="ts">
import { ref } from 'vue'

// import { useChatStore } from '@/store'
import { uploadFileApi } from '@/api/modules/common'
import { ReplyAdd } from '@/api'
import { useEmitt } from '@/hooks/useEmitt'

// const useStore = useChatStore()
const props = defineProps({
  replyType: {
    type: Number,
    default: 1
  }
})
const { emitter } = useEmitt()
const Recorder = ref(uni.getRecorderManager())
const isStopVoice = ref(false) //标识是否正在录音
const recording = ref(false) //加锁 防止点击过快引起的当录音正在准备(还没有开始录音)的时候,却调用了stop方法但并不能阻止录音的问题
const voiceInterval = ref(0 as any) //标识是否正在录音
const voiceTime = ref(0) //总共录音时长
const canSend = ref(true) //是否可以发送
const PointY = ref(0) //坐标位置
const voiceIconText = ref('正在录音...')
const voiceTitle = ref('按住 说话')

//录音开始事件
Recorder.value.onStart(() => {
  beginVoice()
})

//录音结束事件
Recorder.value.onStop((res) => {
  clearInterval(voiceInterval.value)
  handleRecorder(res)
})

//录音出错
Recorder.value.onError(() => {
  clearInterval(voiceInterval.value)
  voiceTime.value = 0
  recording.value = false
})

//准备开始录音
const startVoice = (e: any) => {
  recording.value = true
  isStopVoice.value = false
  canSend.value = true
  voiceIconText.value = '正在录音...'
  PointY.value = e.touches[0].clientY
  Recorder.value.start({
    format: 'mp3'
  })
}

//录音已经开始
const beginVoice = () => {
  if (isStopVoice.value) {
    Recorder.value.stop()
    return
  }
  voiceTitle.value = '松开 结束'
  voiceInterval.value = setInterval(() => {
    if (voiceTime.value > 49) {
      voiceIconText.value = '录音结束倒计时[' + (60 - voiceTime.value) + ']s'
    }

    if (voiceTime.value == 60) {
      clearInterval(voiceInterval.value!)
      endVoice()
    }
    voiceTime.value++
  }, 1000)
}

//move 正在录音中
const moveVoice = (e: any) => {
  const _py = e.touches[0].clientY
  const slideY = PointY.value - _py
  if (slideY > uni.upx2px(120)) {
    canSend.value = false
    voiceIconText.value = '松开手指 取消发送 '
  } else if (slideY > uni.upx2px(60)) {
    canSend.value = true
    voiceIconText.value = '手指上滑 取消发送 '
  } else {
    voiceIconText.value = '正在录音... '
  }
}

//结束录音
const endVoice = () => {
  isStopVoice.value = true //加锁 确保已经结束录音并不会录制
  Recorder.value.stop()
  voiceTitle.value = '按住 说话'
}

//录音被打断
const cancelVoice = (_e: any) => {
  voiceTime.value = 0
  voiceTitle.value = '按住 说话'
  canSend.value = false
  Recorder.value.stop()
}

//处理录音文件
const handleRecorder = ({ tempFilePath, _duration }: any) => {
  if (voiceTime.value < 1) {
    voiceIconText.value = '说话时间过短'
    setTimeout(() => {
      voiceTime.value = 0
      recording.value = false
      clearInterval(voiceInterval.value!)
    }, 200)
    return
  }
  const times = voiceTime.value
  voiceTime.value = 0
  recording.value = false
  clearInterval(voiceInterval.value!)
  if (canSend.value) {
    uploadVoice(tempFilePath, times)
    return
  } else {
    return
  }
}

//发送语音
const uploadVoice = async (tempFilePath: any, duration: number) => {
  uni.showLoading({ title: '上传中...' })
  const res: any = await uploadFileApi('chatVoice', tempFilePath, tempFilePath, duration)
  console.log('res', res)
  uni.hideLoading()
  if (!res || !res.success || !res.value) {
    uni.showToast({ title: '上传语音失败', icon: 'error' })
    return
  } else {
    const addRes = await ReplyAdd({ replyType: props.replyType, voiceId: res.value.id })
    if (addRes && addRes.success) {
      emitter.emit('update:chatList')
    }
  }
}
</script>
<template>
  <view>
    <view
      style="width: 100%"
      @touchstart.stop.prevent="startVoice"
      @touchmove.stop.prevent="moveVoice"
      @touchend.stop="endVoice"
      @touchcancel.stop="cancelVoice"
      :style="{ background: recording ? '#c7c6c6' : '#FFFFFF' }"
    >
      {{ voiceTitle }}
    </view>
    <!-- 语音动画 -->
    <view class="voice_an" v-if="recording">
      <view class="voice_an_icon">
        <view id="one" class="wave" />
        <view id="two" class="wave" />
        <view id="three" class="wave" />
        <view id="four" class="wave" />
        <view id="five" class="wave" />
        <view id="six" class="wave" />
        <view id="seven" class="wave" />
      </view>
      <view class="text">{{ voiceIconText }}</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.voice_an {
  width: 300rpx;
  height: 300rpx;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  background-color: rgba(41, 41, 41, 0.7);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border-radius: 10rpx;
  z-index: 100;

  .text {
    padding-top: 10rpx;
  }

  @keyframes runVoice {
    0% {
      height: 10%;
    }

    20% {
      height: 50%;
    }

    50% {
      height: 100%;
    }

    80% {
      height: 50%;
    }

    100% {
      height: 0%;
    }
  }

  .wave {
    width: 6rpx;
    height: 100%;
    margin-left: 10rpx;
    border-radius: 50rpx;
    background-color: #999;
    vertical-align: middle;
    display: inline-block;
  }

  .voice_an_icon {
    width: 200rpx;
    height: 100rpx;
    line-height: 50rpx;
    margin: 50rpx 0;

    & > view {
      &:nth-child(1) {
        animation: runVoice 0.6s infinite 0.1s;
      }

      &:nth-child(2) {
        animation: runVoice 0.6s infinite 0.3s;
      }

      &:nth-child(3) {
        animation: runVoice 0.6s infinite 0.6s;
      }

      &:nth-child(4) {
        animation: runVoice 0.6s infinite 0.1s;
      }

      &:nth-child(5) {
        animation: runVoice 0.6s infinite 0.3s;
      }

      &:nth-child(6) {
        animation: runVoice 0.6s infinite 0.6s;
      }

      &:nth-child(7) {
        animation: runVoice 0.6s infinite 0.1s;
      }
    }
  }
}
</style>
