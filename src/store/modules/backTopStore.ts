import { defineStore } from 'pinia'

type BackTopType = {
  backTopAttrs: Recordable
  setScrollTop: Fn
  scrollHeight: number
}

const useBackTopStore = defineStore('backTop', {
  state: () => {
    return {
      recordKey: '',
      recordMap: {} as Recordable<BackTopType>
    }
  },
  getters: {
    getBackTop(state) {
      return state.recordMap?.[state.recordKey]
    }
  },
  actions: {
    addBackTopRecord(recordKey: string) {
      this.recordMap[recordKey] = {
        backTopAttrs: { right: 60, bottom: 100, isScrollView: true } as Recordable,
        setScrollTop: () => {},
        scrollHeight: 0
      } as BackTopType
    }
  }
})
export default useBackTopStore
