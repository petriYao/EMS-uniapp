import { defineStore } from 'pinia'
import { IChatMessage, RecordCodeEnum } from '@/types/chatModel'

const useChatStore = defineStore('chat', {
  state: () => {
    return {
      defCommentHeight: 65,
      commentHeight: 65,
      automaticHeight: '0',
      panelHeight: 300,
      keyboardHeight: 0,
      userID: '',
      recvId: '',
      chatSdk: null as null | any,
      heartbeatInterval: null as any, //心跳间隔
      heartbeatTime: 0,
      loginStatus: 0, // 0 未登录 1登录成功 2登录失败
      loginNumber: 0,
      totalUnreadMsgCount: null as null | number | string,
      chatList: [] as IChatMessage[],
      updateId: 0,
      currentAudio: null as null | IChatMessage,
      recordCode: RecordCodeEnum.inactive // 0 未录音 1 录音中 2 取消录音中
    }
  },
  getters: {
    recordCodeTitle(state) {
      switch (state.recordCode) {
        case RecordCodeEnum.active:
          return '松开发送，上滑取消'
      }
      return ''
    }
  },
  actions: {
    initHeight() {
      uni.hideKeyboard()
      this.commentHeight = this.defCommentHeight
      this.keyboardHeight = 0
    },
    initChat() {
      if (this.chatSdk) {
        this.chatSdk.destroy()
        this.chatSdk = null
      }
    },
    setPanelHeight(panelHeight: number) {
      this.panelHeight = panelHeight
    },
    setCommentHeight(commentHeight: number) {
      this.commentHeight = commentHeight
    },
    setKeyboardHeight(keyboardHeight: number) {
      this.keyboardHeight = keyboardHeight
    },
    setRecordCode(recordCode: RecordCodeEnum) {
      this.recordCode = recordCode
    }
  }
})

export default useChatStore
