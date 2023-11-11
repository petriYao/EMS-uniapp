/**
 * 配置本地存储
 */
import { initApp, setPersonalInfo } from '@/hooks/useApp'
import { findIndex } from '@/utils'

const userIdentitykey = 'userIdentitykey'
const userIdentityListkey = 'userIdentityListkey'
const qrCodeListkey = 'qrCodeListkey'
const areaDatakey = 'areaDatakey_20231026'

//上传至本地缓存
export function setLocal(name: string, data: any) {
  try {
    uni.setStorageSync(name, data)
  } catch (e) {
    // error
    return false
  }
  return true
}

//获取本地缓存
export function getLocal(name: string) {
  return uni.getStorageSync(name)
}

//上传登录数据
export function setUserIdentity(userIdentity: any, isNoInit = false) {
  const data = userIdentity
  const res = getUserIdentity()
  //更新账号密码
  if (!data.sessionId) {
    data['userId'] = res.userId
    data['sessionName'] = res.sessionName
    data['sessionId'] = res.sessionId
    data['encryptIv'] = res.encryptIv
    data['encryptKey'] = res.encryptKey
  }
  //设置
  setLocal(userIdentitykey, JSON.stringify(data))

  //更新列表
  updateUserIdentityList(data)

  //初始化
  if (!isNoInit) {
    //初始化App
    initApp()
  } else {
    //设置个人信息
    setPersonalInfo(data)
  }
}

//获取登录状态
export function getUserIdentity() {
  const str = getLocal(userIdentitykey)
  return str ? JSON.parse(str) : null
}

//清空登入信息
export function clearUserIdentity() {
  setLocal(userIdentitykey, '')
  setLocal(userIdentityListkey, '')
  initApp()
}

//设置账号列表
export function setUserIdentityList(data?: any) {
  return setLocal(userIdentityListkey, data ? JSON.stringify(data) : '')
}

//获取账号列表
export function getUserIdentityList() {
  const str = getLocal(userIdentityListkey)
  return str ? JSON.parse(str) : null
}

//更新账号列表
export function updateUserIdentityList(data: any) {
  //更新账号列表的值
  let userList = getUserIdentityList()
  if (userList && userList.length > 0) {
    const index = findIndex(userList, (v: any) => v.userId === data.userId)
    if (index > -1) {
      userList.splice(index, 1)
    }
    userList.unshift(data)
  } else {
    userList = [data]
  }
  setUserIdentityList(userList)
}

//设置二维码列表
export function setQrCodeListCache(data?: any) {
  return setLocal(qrCodeListkey, data ? JSON.stringify(data) : '')
}

//获取二维码列表
export function getQrCodeListCache() {
  const str = getLocal(qrCodeListkey)
  return str ? JSON.parse(str) : null
}

//设置地区城市列表
export function setAreaDataCache(data: string) {
  return setLocal(areaDatakey, data)
}

//获取地区城市列表
export function getAreaDataCache() {
  const str = getLocal(areaDatakey)
  return str ? JSON.parse(str) : null
}
