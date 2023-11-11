import { defineStore } from 'pinia'

export type modalType = {
  show: boolean
  title: string
  content: string
  type: 0 | 1 | 2
}

const useModalStore = defineStore('modal', {
  state: () => {
    return {
      show: false,
      title: '',
      content: '',
      type: 0 // 0 加载 1 错误 2 未登录
    } as modalType
  },
  getters: {
    modalData(state) {
      return { show: state.show, title: state.title, content: state.content, type: state.type }
    }
  },
  actions: {
    setData(data: modalType) {
      this.show = data.show
      this.title = data.title
      this.content = data.content
      this.type = data.type
    },
    clearData() {
      this.show = false
      this.title = ''
      this.content = ''
    }
  }
})

export default useModalStore
