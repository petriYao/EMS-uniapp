import { defineStore } from 'pinia'
import { IChatMessage, RecordCodeEnum } from '@/types/chatModel'

const useChatStore = defineStore('chat', {
  state: () => {
    return {
      commentHeight: 65,
      defCommentHeight: 65,
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
    loginStatusTitle(state) {
      switch (state.loginStatus) {
        case 0:
          return '微讯未连接，请检查是否已登入'
        case 2:
          return '微讯重连接中...第' + state.loginNumber + '次'
      }
      return ''
    },
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
    updateTotalUnreadMsgCount() {
      if (this.loginStatus != 1) return
      this.chatSdk?.getTotalUnreadMsgCount().then((res) => {
        this.totalUnreadMsgCount = res.data == 0 ? null : res.data > 99 ? '99+' : res.data
      })
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
