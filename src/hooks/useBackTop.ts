import { useBackTopStore } from '@/store'

export const updateScrollHeight = (value: number) => {
  const backTopStore = useBackTopStore()
  backTopStore.getBackTop.scrollHeight = value
}

export const onScrollHeight = (event: any) => {
  updateScrollHeight(event.detail.scrollTop)
}

export const enableBackTop = (setScrollTop: any, attrs = { bottom: 100 as any, right: 60 }) => {
  const backTopAttrs = {
    bottom: attrs.bottom,
    right: attrs.right,
    isScrollView: true
  }
  const backTopStore = useBackTopStore()
  backTopStore.getBackTop.backTopAttrs = backTopAttrs
  backTopStore.getBackTop.setScrollTop = setScrollTop
}

export const enablePageBackTop = (onPageScroll: any, attrs = { bottom: 80 as any, right: 60 }) => {
  const backTopAttrs = {
    bottom: attrs.bottom,
    right: attrs.right,
    isScrollView: false
  }
  const backTopStore = useBackTopStore()
  backTopStore.getBackTop.backTopAttrs = backTopAttrs
  onPageScroll((e: any) => {
    updateScrollHeight(e.scrollTop)
  })
}
