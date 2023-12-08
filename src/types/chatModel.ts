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
  recvId: string //
  startClientMsgID?: string //
}

export interface IChatMessage {
  clientMsgID: string // 标识
  sendID?: string // 发送者
  recvID?: string // 接收者
  senderFaceUrl?: string // 头像
  senderNickname?: string
  contentType?: number // 消息类型
  status?: number // 消息状态
  createTime?: number //时间
  content?: string // 消息内容
  pictureElem?: IChatImage //图片
  soundElem?: IChatAudio //语音
  isRead: boolean
  seq?: number
  /** 以下是渲染使用参数 */
  anmitionPlay?: PlayCodeEnum //语音消息使用
}

export interface IChatImage {
  snapshotPicture: IChatImageBean //
  bigPicture: IChatImageBean //
}

export interface IChatImageBean {
  url: string //
}

export interface IChatAudio {
  sourceUrl: string //
  duration: number //
}
