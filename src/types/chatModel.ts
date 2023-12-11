export enum CurrentTypeEnum {
  text,
  record
}

export enum RecordCodeEnum {
  /**
   * 未录音
   */
  inactive,
  /**
   * 录音中
   */
  active,
  /**
   * 录音取消
   */
  cancel
}

export enum PlayCodeEnum {
  /**
   * 未播放
   */
  inactive,
  /**
   * 加载中
   */
  loading,
  /**
   * 播放中
   */
  active
}

export interface IChat {
  loginState: number // 登录状态
  chatList: IChatMessage[] // 当前聊天窗口消息
  updateId: number // 更新id
  tempFilePath: Record<string, string> //临时文件缓存
}

export interface IChatParams {
  order: number
  replyId: number
  replyType: number
  size: number
}

export interface IChatMessage {
  isMy: number
  replyContent: ReplyContent
  contentType: number
  replyId: number
  replyTime: number
  /** 以下是渲染使用参数 */
  anmitionPlay?: PlayCodeEnum //语音消息使用
}

export interface ReplyContent {
  image: Image
  text: string
  voice: Image
}

export interface Image {
  duration: number
  id: number
  imageDim: ImageDim
  listUrl: string
  name: string
  previewUrl: string
  url: string
}

export interface ImageDim {
  height: number
  width: number
}
