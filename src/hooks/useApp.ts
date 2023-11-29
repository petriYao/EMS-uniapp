import { useAppStore } from '@/store'
import { getImageURLNeedWl } from '@/utils'

export const initCacheIamge = () => {
  const appStore = useAppStore()
  const imageArray = [
    { name: 'introductionBG', image: getImageURLNeedWl('home', 'home-introduction') }
  ] as any[]
  for (const item of imageArray) {
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
