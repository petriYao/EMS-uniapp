export type UserIdentityType = {
  encryptKey: string
  encryptIv: string
  sessionName: string
  sessionId: string
  id: string
  userId: string
  userType: string
  isBindWx: number
  roleId: number
  status: number
  userHead: UserHeadType
  userInfo: UserInfoType
}

export type UserInfoType = {
  userNickname?: string
  userPhoneNumber?: string
  avatarId?: number
  avatarImage?: AvatarImageType
  sex?: number
  email?: string
  qq?: string
}

export type UserHeadType = {
  avatarImage: AvatarImageType
  title: string
  content: string
  tags: TagType[]
  message: string
}

export type TagType = {
  title: string
  color: string
  background: string
  isPlain: number
}

export type AvatarImageType = {
  id: number
  name: string
  url: string
  listUrl: string
  previewUrl: string
  imageDim: ImageDimType
  duration: number
}

export type ImageDimType = {
  width: number
  height: number
}

export type UserInfoApiType = {
  id: string
  userId: string
  userType: string
  isBindWx: number
  roleId: number
  status: number
  userHead: UserHeadType
  userInfo: UserInfoType
}

export type MeetingRoomListType = {
  meetingRoomDes: string
  meetingRoomId: string
  meetingRoomName: string
  meetingRoomStatus: number
}

export type optionsType = {
  label: string
  value: string | number
  type?: number
  isSelect?: boolean
}

export type MeetingReservationUpdateType = {
  meetingReservationDate: string | Date
  meetingReservationEndTime: string
  meetingReservationStartTime: string
  meetingReservationTitle: string
  meetingRoomId: string | number | null
}

export type ReplyAddType = {
  replyType: number
  imageId?: string
  text?: string
  voiceId?: number
}

export type ReplyListType = {
  replyType: number
  replyId?: any
  order?: number
  size?: number
}

/**旧的 */
// export type UserIdentityType = {
//   sessionName?: string
//   sessionId?: string
//   encryptKey?: string
//   encryptIv?: string
//   userId?: string
// }

//注册信息
// export type LogOnMessageType = {
//   userPhoneNumber: string
//   phoneCode: string
//   userName?: string
//   avatarId?: string
//   sex?: number
// }

// declare type FormValueType = string | number | string[] | number[] | boolean | undefined | null

// declare type ComponentOptions = {
//   label?: string
//   value?: FormValueType & any
//   disabled?: boolean
//   key?: string | number
//   children?: ComponentOptions[]
//   options?: ComponentOptions[]
// } & Recordable

// export type UserInfoType = {
//   userId?: string
//   userName?: string
//   userRealName?: string
//   userAvatar?: string
//   role?: string
//   roleId?: string
//   companyShortname?: string
//   campusList?: ComponentOptions[]
//   qrcodeInterval?: number
// }
// export type UserLoginType = {
//   username: string
//   password: string
// }
