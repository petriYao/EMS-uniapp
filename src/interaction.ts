import { isDebug } from './config/config'

//获取地址
export const getLocationByApp = () => {
  if (isDebug()) {
    return '119.247885,26.107134'
  }
  return prompt('getLocation', 'getLocation')
}

//获取相机权限
export const getCameraPermissionByApp = () => {
  if (isDebug()) {
    return true
  }
  return prompt('getCameraPermission', 'getCameraPermission') === '1'
}

//获取录音权限
export const getAudioPermissionByApp = () => {
  if (isDebug()) {
    return true
  }
  return prompt('getAudioPermission', 'getAudioPermission') === '1'
}

//打开app设置
export const openAppSetting = () => {
  prompt('openAppSetting', 'openAppSetting')
}

//设置App顶部状态栏的字体的颜色
export const setAppStatusBarTitleColor = (isWhite: boolean) => {
  if (isDebug()) return
  prompt('setAppStatusBarTitleColor', 'setAppStatusBarTitleColor@' + (isWhite ? '1' : '0'))
}

//更新版本
export const openAppUpdater = (url: string) => {
  if (isDebug()) return
  prompt('openAppUpdater', 'openAppUpdater@' + url)
}

//获取密钥
export const getPublicEncrypt = (str: string) => {
  if (isDebug()) return
  return prompt('getPublicEncrypt', 'getPublicEncrypt@' + str)
}

//保存图片  isShare true 保存并分享  result 是 ok 是成功 其他是报错
export const saveImageToApp = (
  base64: string,
  isShare?: boolean,
  complete?: (result: string) => void
) => {
  window.location.href = (isShare ? 'https://share-image?' : 'https://save-image?') + base64
  if (complete) {
    const windowTemp = window as any
    windowTemp.saveImageComplete = complete
  }
}

//下载文件
export const saveFileToApp = async (url: string, name: string) => {
  const link = document.createElement('a')
  link.href = url
  const timestamp = Date.now()
  const fileName = name.replace(/\.[^.]+$/, '')
  const downloadFileName = `${fileName}_${timestamp}`
  link.setAttribute('download', downloadFileName)
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

//注册app键盘监听
export const registerAppKeyboardHeightListener = (f: (height: string) => void) => {
  const windowTemp = window as any
  windowTemp.getAppKeyboardHeight = f
}

//取消app键盘监听
export const unregisterAppKeyboardHeightListener = () => {
  const windowTemp = window as any
  windowTemp.getAppKeyboardHeight = null
}
