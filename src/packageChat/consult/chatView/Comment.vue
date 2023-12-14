<script setup lang="ts">
import { reactive, watch, computed, onMounted, onUnmounted, ref } from 'vue'

import { useChatStore, useAppStore } from '@/store'
import { useEmitt } from '@/hooks/useEmitt'
import { getSvgURL } from '@/utils'
import { CurrentTypeEnum } from '@/types/chatModel'
import { ReplyAdd, getReplyAutomaticList } from '@/api'

import emojiList from './components/emoji.json'
import voiceBtn from './components/voiceBtn.vue'
import funBtn from './components/funBtn.vue'
import {
  registerAppKeyboardHeightListener,
  unregisterAppKeyboardHeightListener
} from '@/interaction'

const props = defineProps({
  replyType: {
    type: Number,
    default: 1
  }
})

const { emitter } = useEmitt()

const useStore = useChatStore()
const appStore = useAppStore()

const textHeight = computed(
  () =>
    (state.currentType == CurrentTypeEnum.record
      ? useStore.defCommentHeight
      : useStore.commentHeight) - 2
)

//原始高度
const panelHeight = computed(() => useStore.panelHeight)

const automaticList = ref([] as string[])

//参数
const state = reactive({
  replyType: props.replyType,
  content: '', //输入内容
  showPanel: false, //是否显示面板
  showSubmitBtn: false, //是否显示发送按钮
  showEmo: false, //是否显示表情
  currentType: CurrentTypeEnum.text //内容状态
})

//输入框的参数
const reactiveInput = reactive({
  //输入框的焦点
  focus: false as unknown | boolean,
  //光标的位置
  cursor: 0,
  // //滚动条位置
  // scrollTop: 0
  oldInputCount: 0
})

//添加表情
const clickEmoItem = (item: any) => {
  state.content += item.char
}

//面板切换更新信息高度
const updateHeight = () => {
  let heightTemp = 0
  if (state.showPanel) {
    useStore.setKeyboardHeight(0)
    heightTemp = useStore.panelHeight
  } else {
    heightTemp = useStore.keyboardHeight
  }
  if (state.currentType == CurrentTypeEnum.record) {
    heightTemp += useStore.defCommentHeight
  } else {
    heightTemp += useStore.commentHeight
  }

  emitter.emit('MChat:updateHeight', heightTemp)
}

//显示键盘
const showKeyboard = () => {
  if (reactiveInput.focus) reactiveInput.focus = undefined
  reactiveInput.focus = true
  reactiveInput.cursor = state.content.length
}

//显示键盘2
const showKeyboardTwo = () => {
  if (reactiveInput.focus) reactiveInput.focus = undefined
  if (state.content.length <= 0) {
    reactiveInput.focus = true
    return
  }
  const temp = state.content
  state.content = ' '
  reactiveInput.focus = true

  setTimeout(() => {
    state.content = temp
    reactiveInput.cursor = state.content.length
  }, 300)
}

//隐藏键盘
const hideKeyboard = () => {
  if (reactiveInput.focus === false) reactiveInput.focus = undefined
  uni.hideKeyboard()
  reactiveInput.focus = false
}

//点击图标
const clickIcon = (name: string) => {
  let KeyboardType = 0
  switch (name) {
    case 'panel':
      state.currentType = CurrentTypeEnum.text
      if (state.showPanel) {
        if (state.showEmo) {
          state.showEmo = false
        } else {
          state.showPanel = false
          KeyboardType = 1
        }
      } else {
        state.showPanel = true
        state.showEmo = false
        KeyboardType = 2
      }
      break
    case 'record':
      state.currentType = CurrentTypeEnum.record
      state.showPanel = false
      state.showEmo = false
      KeyboardType = 2
      break
    case 'keyboard':
      if (state.currentType == CurrentTypeEnum.record) {
        KeyboardType = 3
      } else {
        KeyboardType = 1
      }
      state.currentType = CurrentTypeEnum.text
      state.showPanel = false
      state.showEmo = false
      break
    case 'emoji':
      state.currentType = CurrentTypeEnum.text
      state.showPanel = true
      state.showEmo = true
      KeyboardType = 2
      break
    case 'close':
      if (state.showPanel || useStore.keyboardHeight > 0) {
        state.showPanel = false
        state.showEmo = false
        KeyboardType = 2
      }
      break
  }
  switch (KeyboardType) {
    case 1:
      showKeyboard()
      break
    case 2:
      hideKeyboard()
      updateHeight()
      break
    case 3:
      showKeyboardTwo()
      break
    default:
      updateHeight()
  }
}

const onLinechange = (e: any) => {
  let commentHeight = e.detail.height + uni.upx2px(40) + 18
  const maxHeight = uni.upx2px(280 + 40)
  if (commentHeight > maxHeight) {
    useStore.commentHeight = maxHeight
  } else if (commentHeight > useStore.defCommentHeight) {
    useStore.commentHeight = commentHeight
  } else {
    useStore.commentHeight = useStore.defCommentHeight
  }
  //滚动条
  //reactiveInput.scrollTop = commentHeight > maxHeight ? commentHeight - maxHeight : 0
  updateHeight()
}

const onInputTextarea = (e: any) => {
  let regex = /\n/g
  let count = (e.detail.value.match(regex) || []).length
  if (count > 3) {
    count = 3
  }

  if (reactiveInput.oldInputCount === count) return
  reactiveInput.oldInputCount = count
  let commentHeight = count * 28 + uni.upx2px(40) + 18
  const maxHeight = uni.upx2px(280 + 40)
  if (commentHeight > maxHeight) {
    useStore.commentHeight = maxHeight
  } else if (commentHeight > useStore.defCommentHeight) {
    useStore.commentHeight = commentHeight
  } else {
    useStore.commentHeight = useStore.defCommentHeight
  }
  //滚动条
  //reactiveInput.scrollTop = commentHeight > maxHeight ? commentHeight - maxHeight : 0
  updateHeight()
}

//软键盘监听
const onKeyboardHeightChange = (res: any) => {
  useStore.setKeyboardHeight(res.height)
  if (res.height > 0) {
    if (useStore.panelHeight != res.height) {
      useStore.setPanelHeight(res.height)
    }
    state.showPanel = false
  } else {
    reactiveInput.focus = false
  }
  updateHeight()
}

//发送消息
const sendMessage = async () => {
  if (!state.content) return
  const tempText = state.content
  const res = await ReplyAdd({
    replyType: state.replyType,
    text: tempText
  })
  if (res && res.success) {
    state.content = ''
    emitter.emit('Messages:getNewData')
  }
}

//自动回复列表
const getAutomaticList = async () => {
  const res = await getReplyAutomaticList(state.replyType)
  if (res && res.success && res.value) {
    automaticList.value = res.value?.list ?? []
  }
  useStore.automaticHeight = automaticList.value.length > 0 ? uni.upx2px(80) : 0
  updateHeight()
}

//自动回复
const itemClick = async (item: string) => {
  const res = await ReplyAdd({
    replyType: state.replyType,
    text: item
  })
  if (res && res.success) {
    emitter.emit('Messages:getNewData')
  }
}

useEmitt({
  name: 'Comment:closePanel',
  callback: () => {
    clickIcon('close')
  }
})

useEmitt({
  name: 'Comment:reedit',
  callback: (val: string) => {
    state.content = val
    state.currentType = CurrentTypeEnum.text
    if (reactiveInput.focus) {
      showKeyboard()
    } else {
      showKeyboardTwo()
    }
  }
})

useEmitt({
  name: 'Comment:getAutomaticList',
  callback: () => {
    getAutomaticList()
  }
})

//监听文本消息
watch(
  () => state.content,
  () => {
    state.content ? (state.showSubmitBtn = true) : (state.showSubmitBtn = false)
  }
)

//加载后
onMounted(() => {
  //#ifdef MP-WEIXIN
  uni.onKeyboardHeightChange(onKeyboardHeightChange)
  //#endif
  //#ifdef H5
  registerAppKeyboardHeightListener((height: string) => {
    const res = { height: Number(height) * appStore.screenHeight }
    onKeyboardHeightChange(res)
  })
  //#endif
  getAutomaticList()
})

//释放
onUnmounted(() => {
  //取消键盘监听
  //#ifdef MP-WEIXIN
  uni.offKeyboardHeightChange(onKeyboardHeightChange)
  //#endif

  //#ifdef H5
  unregisterAppKeyboardHeightListener()
  //#endif
  //初始化高度
  useStore.initHeight()
})
</script>

<template>
  <view class="h-80rpx flex items-center px-20rpx bg-[#EDEDED]" v-if="automaticList?.length > 0">
    <scroll-view scroll-x>
      <view class="flex">
        <view
          v-for="(item, index) of automaticList"
          :key="index"
          class="mr-20rpx rounded-50 bg-[#FFF] py-6rpx px-20rpx whitespace-nowrap"
          @click="itemClick(item)"
        >
          {{ item }}
        </view>
      </view>
    </scroll-view>
  </view>
  <view
    class="input-container"
    :style="`height:${textHeight}px`"
    style="border-top: 1px solid #d9d9d9; border-bottom: 1px solid #d9d9d9"
  >
    <view class="flex justify-center items-end h-100%">
      <view class="flex items-center h-60rpx">
        <u-icon
          v-if="state.currentType == CurrentTypeEnum.text"
          @tap="clickIcon('record')"
          :name="getSvgURL('chat', 'record')"
          size="50rpx"
          color="#000"
        />
        <u-icon
          v-else
          @tap="clickIcon('keyboard')"
          :name="getSvgURL('chat', 'keyboard')"
          size="50rpx"
          color="#000"
        /> </view
    ></view>
    <view
      v-if="state.currentType == CurrentTypeEnum.text"
      class="bg-#FFF flex-1 py-9px mx-20rpx rounded-10rpx"
    >
      <scroll-view scroll-y class="inputScroll flex-1">
        <view>
          <!-- #ifdef MP-WEIXIN -->
          <u-textarea
            ref="textRef"
            v-model="state.content"
            :autoHeight="true"
            :showConfirmBar="false"
            :adjustPosition="false"
            :holdKeyboard="true"
            :cursorSpacing="15"
            :maxlength="1000"
            :focus="reactiveInput.focus"
            :cursor="reactiveInput.cursor"
            @linechange="onLinechange"
            placeholder="输入消息"
            confirm-type="newLine"
          />
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <view class="px-10rpx">
            <textarea
              v-model="state.content"
              placeholder="输入消息"
              placeholder-class="textarea-placeholder"
              auto-height
              style="width: 100%; max-height: 180rpx; font-size: 28rpx"
              @input="onInputTextarea"
            ></textarea>
          </view>
          <!-- #endif -->
        </view>
      </scroll-view>
    </view>
    <view v-else class="voice_title mx-20rpx flex-1 h-70rpx">
      <voice-btn :replyType="state.replyType" />
    </view>

    <view class="text-0 flex justify-center items-end h-100%">
      <!-- 发送消息 -->
      <view class="flex items-center h-60rpx">
        <u-icon
          v-if="!state.showEmo || !state.showPanel || state.currentType !== CurrentTypeEnum.text"
          @tap="clickIcon('emoji')"
          :name="getSvgURL('chat', 'emoji')"
          size="50rpx"
          color="#000"
        />
        <u-icon
          v-else
          @tap="clickIcon('keyboard')"
          :name="getSvgURL('chat', 'keyboard')"
          size="50rpx"
          color="#000"
        />
        <view
          class="ml-20rpx"
          v-if="state.currentType == CurrentTypeEnum.text && state.showSubmitBtn"
        >
          <u-button
            @tap="sendMessage"
            custom-style="white-space: nowrap;font-size: 28rpx;color: #FFF;width:120rpx;height:60rpx;border-radius:10rpx;border:0;background: #196CFF;"
          >
            发送
          </u-button>
        </view>
        <view v-else class="ml-20rpx">
          <u-icon
            @tap="clickIcon('panel')"
            :name="getSvgURL('chat', 'panel')"
            size="50rpx"
            color="#000"
          />
        </view>
      </view>
    </view>
  </view>
  <!-- 操作栏 -->
  <view v-if="state.showPanel" class="px-40rpx bg-#f5f5f5" :style="`height:${panelHeight}px`">
    <!-- 表情包 -->
    <view class="mc-emoji" v-if="state.showEmo">
      <!--自定义表情面板 -->
      <view class="mc-emoji__wrap">
        <view
          class="mc-emoji__item"
          v-for="(item, index) in emojiList"
          :key="index"
          @tap="clickEmoItem(item)"
        >
          {{ item.char }}
        </view>
      </view>
    </view>
    <view v-else>
      <funBtn :replyType="state.replyType" />
    </view>
  </view>
</template>

<style lang="less" scoped>
.inputScroll {
  max-height: 280rpx;
}

.voice_title {
  text-align: center;
  border-radius: 10rpx;
  min-height: 70rpx;
  line-height: 70rpx;
}

//#ifdef MP-WEIXIN
::v-deep .u-textarea__field {
  margin: -9px !important;
}
//#endif

.input-container {
  width: 100%;
  background-color: #f7f7f7;
  display: flex;
  align-items: center;
  padding: 14px 20rpx;
  box-sizing: border-box;
}

input {
  flex: 1;
  margin-right: 10px;
}

.mc-emoji {
  height: 100%;
  overflow-y: auto;

  .mc-emoji__wrap {
    display: flex;
    flex-flow: row wrap;
  }

  .mc-emoji__item {
    flex-basis: 15%;
    margin: 1.5vw 2vw;
    font-size: 6vw;
    user-select: none;
    text-align: center;
    box-sizing: content-box;
  }
}
//隐藏滚动条
::-webkit-scrollbar {
  display: none;
}
// 隐藏滚动条
::v-deep ::-webkit-scrollbar {
  display: none;
}
</style>
