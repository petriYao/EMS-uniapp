export type UserIdentityType = {
  sessionName?: string
  sessionId?: string
  encryptKey?: string
  encryptIv?: string
  userId?: string
}

//注册信息
export type LogOnMessageType = {
  userPhoneNumber: string
  phoneCode: string
  userName?: string
  avatarId?: string
  sex?: number
}

declare type FormValueType = string | number | string[] | number[] | boolean | undefined | null

declare type ComponentOptions = {
  label?: string
  value?: FormValueType & any
  disabled?: boolean
  key?: string | number
  children?: ComponentOptions[]
  options?: ComponentOptions[]
} & Recordable

export type UserInfoType = {
  userId?: string
  userName?: string
  userRealName?: string
  userAvatar?: string
  role?: string
  roleId?: string
  companyShortname?: string
  campusList?: ComponentOptions[]
  qrcodeInterval?: number
}
export type UserLoginType = {
  username: string
  password: string
}
