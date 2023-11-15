import type { AxiosRequestHeaders } from 'axios'

import { getUserIdentity } from '@/hooks/useCache'
import { getVersion } from '@/config/config'
import { getRandom, formatMillisecond } from '@/utils'
import { Encrypt } from '@/utils//aesUtils'

//随机数
let randomTokenList = [] as string[]

//添加随机数
const addRandomToken = (randomToken: string) => {
  if (randomTokenList.indexOf(randomToken) >= 0) {
    return
  }
  if (randomTokenList.length > 100) {
    randomTokenList = []
  }
  randomTokenList.push(randomToken)
}

//获取随机数
export const getRandomToken: () => string = () => {
  const userIdentity = getUserIdentity()
  const user_id = userIdentity?.userId ?? '0'

  const randomToken =
    getRandom(8) +
    '__wx-' +
    user_id +
    '__' +
    getVersion() +
    '__' +
    formatMillisecond(new Date()) +
    getRandom(7)

  const randomTokenListLength = randomTokenList.length
  addRandomToken(randomToken)
  if (randomTokenListLength === randomTokenList.length) {
    return getRandomToken()
  }
  return randomToken
}

//判断是不是公开接口
export const getIsPublic = (url: string | undefined) => {
  if (
    url === 'login' ||
    url === 'wx-login' ||
    url === 'register' ||
    url === 'user/find-password' ||
    url === 'send-sms-code' ||
    url === 'check-sms-code'
  ) {
    // 公开接口
    return true
  } else {
    // 不是公开接口
    return false
  }
}

//获取网络头部参数
export const getHttpHeader = (isPublic = false) => {
  const headers = {} as AxiosRequestHeaders
  //设置session
  const userIdentity = getUserIdentity()
  if (userIdentity) {
    const sessionName = userIdentity?.sessionName
    const sessionId = userIdentity?.sessionId
    if (sessionId && sessionName) {
      headers['Authorization'] = sessionName + ' ' + sessionId
    }
  }
  //版本验证
  headers['My-User-Agent'] = 'shuxiaobao_wx__' + getVersion() + '__wifi__' + '800x600'
  //随机令牌
  headers['Random-Token'] = Encrypt(getRandomToken(), isPublic)
  return headers
}
