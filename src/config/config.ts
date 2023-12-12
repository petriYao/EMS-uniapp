/**
 * 配置文件
 */

//是否显示日志
export const isShowApiLog = false

//是否显示聊天日志
export const isShowChatLog = false

//是否关闭交互
export const isCloseInteraction = true

//环境路径 false 线上，true 线下
const debug = false

//图片svg路径 false 线上，true 线下
const urlDebug = true

//是否调试
export const isDebug = () => {
  // return debug && import.meta.env.VITE_USER_NODE_ENV === 'development'
  return debug
}

//图片是否网络路径
export const isURLDebug = () => {
  return urlDebug
}

//应用名称
export const getAppName = () => {
  const val = uni.getSystemInfoSync()
  return val.appName
}

//版本号
export const getVersion = () => {
  const val = uni.getSystemInfoSync()
  return val.appVersion + '.' + val.appVersionCode
}

//腾讯地图的KEY
export const TencentMapsData = {
  url: 'https://apis.map.qq.com/ws/geocoder/v1/',
  key: '4LSBZ-EWYWB-6EEU7-JOV4X-74XG7-ZHFEH'
}

//主机网络路径
export const getDeomeUrl = () => {
  if (isDebug()) {
    return 'http://192.168.3.5'
  } else {
    return 'https://sxb.hlace.com'
  }
}

//基础网络路径
export const getBaseUrl = () => {
  if (isDebug()) {
    return getDeomeUrl() + ':8080'
  } else {
    return getDeomeUrl() + ''
  }
}

//使用的网络路径
export const getPathUrl = () => {
  return getBaseUrl() + '/frontend/'
}

//上传网络路径
export const getUploadUrl = () => {
  return getPathUrl() + 'upload'
}
