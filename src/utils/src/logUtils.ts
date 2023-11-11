import { isShowApiLog, isShowChatLog } from '@/config/config'

//打印日志
export const showLog = (...item: any[]) => {
  console.log(...item)
}

//打印接口日志
export const showApiLog = (...item: any[]) => {
  if (isShowApiLog) console.log('apiLog', ...item)
}

//打印聊天日志
export const showChatLog = (...item: any[]) => {
  if (isShowChatLog) console.log('chatLog', ...item)
}
