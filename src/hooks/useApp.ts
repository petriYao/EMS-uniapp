import { useAppStore } from '@/store'
import { getImageURLNeedWl } from '@/utils'

export const initCacheIamge = () => {
  const appStore = useAppStore()
  const imageArray = [
    { name: 'homeBG', image: getImageURLNeedWl('home', 'homeBG') }, //逛逛背景
    { name: 'noData', image: getImageURLNeedWl('home', 'no-data') } //无数据
  ]
  for (const item of imageArray) {
    if (1 == 1) continue
    uni.downloadFile({
      url: item.image,
      success: (res) => {
        appStore.cacheImageList[item.name] = res.tempFilePath
      },
      fail: () => {
        appStore.cacheImageList[item.name] = item.image
      }
    })
  }
}

export const initApp = async () => {
  const appStore = useAppStore()
  appStore.initApp()
}

export const getHomeIndex = () => {}

export const setPersonalInfo = (value?: any) => {
  const appStore = useAppStore()
  appStore.setPersonalInfo(value)
}
