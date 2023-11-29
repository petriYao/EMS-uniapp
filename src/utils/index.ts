import { isURLDebug } from '@/config/config'
import { Md5 } from 'ts-md5'

//日志
export * from './src/logUtils'

//工具
export * from './src/lodash'

//字段
export * from './src/columnUnit'

const ossUrl = 'https://shuxiaobao-wx.oss-cn-fuzhou.aliyuncs.com/b62fc9be67c9b51330e999b23e1556e5-'

export function getImageURL(path: string, name: string, needWl?: boolean) {
  //#ifdef MP-WEIXIN
  if (isURLDebug() && !needWl) {
    return `/static/img/${path}/${name}.png`
  }
  const key = `/img/${path}/${name}.png`
  const md5 = Md5.hashStr(key)
  return ossUrl + md5
  //#endif
  return new URL(`/src/static/img/${path}/${name}.png`, import.meta.url).href
}

export function getImageURLNeedWl(path: string, name: string) {
  return getImageURL(path, name, true)
}

export function getSvgURL(path: string, name: string) {
  //#ifdef MP-WEIXIN
  if (isURLDebug()) {
    return `/static/svg/${path}/${name}.svg`
  }
  const key = `/svg/${path}/${name}.svg`
  const md5 = Md5.hashStr(key)
  return ossUrl + md5
  //#endif
  return new URL(`/src/static/svg/${path}/${name}.svg`, import.meta.url).href
}

//创建uview方法
export function getUview() {
  const uniTemp = uni as any
  return uniTemp.$u
}

export const setCssVar = (prop: string, val: any, dom = document.documentElement) => {
  dom.style.setProperty(prop, val)
}

/**
 * @param str 需要转下划线的驼峰字符串
 * @returns 字符串下划线
 */
export const humpToUnderline = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 查找数组对象的某个下标
 * @param {Array} ary 查找的数组
 * @param {Functon} fn 判断的方法
 */
// eslint-disable-next-line
export const findIndex = <T = Recordable>(ary: Array<T>, fn: Fn): number => {
  if (ary.findIndex) {
    return ary.findIndex(fn)
  }
  let index = -1
  ary.some((item: T, i: number, ary: Array<T>) => {
    const ret: T = fn(item, i, ary)
    if (ret) {
      index = i
      return ret
    }
  })
  return index
}

/**
 * @param {Date | number | string} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatTime(time: Date | number | string, fmt: string) {
  if (!time) return ''
  else {
    const date = new Date(time)
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds()
    } as any
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
        )
      }
    }
    return fmt
  }
}

// 格式毫秒
export const formatMillisecond = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const now = date.getTime()
  const endDate = new Date('2022/01/01 00:00:00') //设置截止时间
  const end = endDate.getTime()
  const leftTime = now - end //时间差
  const ms = pad(Math.floor(leftTime % 1000).toString(), 3)
  return `${[year, month, day].map(formatNumber).join('-')}-${[hour, minute, second]
    .map(formatNumber)
    .join('-')}__${ms}`
}
// 数字格式
const formatNumber = (n: number) => {
  const m = n.toString()
  return m[1] ? n : `0${n}`
}

/* 质朴长存法  by lifesinger */
const pad = (num: string, n: number) => {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}

export const formatTimeByChat = (time: number, type: number) => {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hourTemp = date.getHours()
  const minuteTemp = date.getMinutes()
  const hours = hourTemp < 10 ? '0' + hourTemp : hourTemp
  const minutes = minuteTemp < 10 ? '0' + minuteTemp : minuteTemp
  switch (type) {
    case 1:
      return hours + ':' + minutes
    case 2:
      return month + '月' + day + '日 ' + hours + ':' + minutes
    case 3:
      return year + '年' + month + '月' + day + '日 ' + hours + ':' + minutes
    case 4:
      return year + '年' + month + '月' + day + '日'
    case 5:
      return year + '-' + month + '-' + day
  }
  return ''
}

//计算会话列表时间
export const getChatTime = (time: number, isList = false) => {
  const currentDate = formatTimeByChat(Date.now(), 5)
  const messageDate = formatTimeByChat(time, 5)

  let formattedTime = ''
  let formattedTimeType = 3
  if (currentDate === messageDate) {
    formattedTimeType = 1
  } else if (formatTimeByChat(Date.now() - 24 * 60 * 60 * 1000, 5) == messageDate) {
    formattedTime = '昨天  '
    formattedTimeType = 1
  } else if (new Date(currentDate).getFullYear() == new Date(messageDate).getFullYear()) {
    formattedTimeType = 2
  }

  if (isList && formattedTimeType == 3) {
    formattedTimeType = 4
  }

  formattedTime += formatTimeByChat(time, formattedTimeType)

  return formattedTime
}

//计算会话内容时间
export const getShouldShowTime = (currentTime: number, lastTime: number) => {
  if (!lastTime) {
    // 如果是第一条消息，显示时间
    lastTime = currentTime
    return getChatTime(currentTime)
  }

  const timeDifference = currentTime - lastTime
  // 如果时间间隔超过5分钟，显示时间
  if (Math.abs(timeDifference) > 5 * 60 * 1000) {
    return getChatTime(currentTime)
  } else {
    return ''
  }
}

export const getRandom = (n: number) => {
  const charts = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ]
  let res = ''
  for (let i = 0; i < n; i++) {
    const id = Math.ceil(Math.random() * 61)
    res += charts[id]
  }
  return res
}
