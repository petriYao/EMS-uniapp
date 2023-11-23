import { getUserIdentity } from '@/hooks/useCache'
import { useAxios } from '@/hooks/useAxios'
import { UserIdentityType, UserInfoApiType, UserInfoType } from '@/types/userModel'
// import { AppSetInfoType } from '@/types/commonModel'

const { post } = useAxios()
/**
 * 注册
 */
export const registerApi = (userPhoneNumber: string, phoneCode: string, userPassword: string) => {
  return post<UserIdentityType>('register', {
    userPhoneNumber,
    phoneCode,
    userPassword
  })
}

/**
 * 登录
 */
export const loginApi = (userPhoneNumber: string, userPassword: string): any => {
  return post<UserIdentityType>('login', {
    userPhoneNumber,
    userPassword
  })
}
/**
 * 微信登录
 */
export function wxLogin(loginCode: string): any {
  return post<any>('wx-login', {
    loginCode
  })
}

/**
 * 微信绑定账号
 */
export function wxBindAccount(phoneCode: string): any {
  return post<any>('wx-bind-account', {
    phoneCode
  })
}

/**
 * 获取验证码
 * @param phone 手机号
 */
export const sendSmsCodeApi = (userPhoneNumber: string, operateType: number) => {
  return post<any>('send-sms-code', {
    userPhoneNumber,
    operateType
  })
}

/**
 * 验证验证码
 */
export const checkSmsCodeApi = (
  userPhoneNumber: string,
  operateType: number,
  phoneCode: string
) => {
  return post<any>('check-sms-code', {
    userPhoneNumber,
    operateType,
    phoneCode
  })
}

/**
 * 找回密码
 */
export const findPasswordApi = (
  userPhoneNumber: string,
  phoneCode: string,
  userPassword: string
) => {
  return post<any>('user/find-password', {
    userPhoneNumber,
    phoneCode,
    userPassword
  })
}

/**
 * 当前登录用户信息
 */
export const getUserInfoApi = () => {
  const val = getUserIdentity()
  return post<UserInfoApiType>('user/info', {
    params: val
  })
}

/**
 * 修改用户信息
 */
export const updateUserApi = (data: UserInfoType) => {
  return post<any>('user/update', data)
}

/**
 * 退出登录
 */
export const logoutApi = (): any => {
  return post<any>('logout', {})
}

/**
 * 微信登录
 */
export const wxLoginApi = (loginCode: string): any => {
  return post<any>('wx-login', {
    loginCode
  })
}

/**
 * 微信绑定账号
 */
export const wxBindAccountApi = (phoneCode: string): any => {
  return post<any>('wx-bind-account', {
    phoneCode
  })
}

/**
 * 账号绑定微信
 */
export const accountBindWxApi = (bindCode: string): any => {
  return post<any>('account-bind-wx', {
    bindCode
  })
}

/**
 * 修改密码
 */
export const updatePasswordApi = (oldUserPassword: string, userPassword: string) => {
  return post<any>('user/update-password', {
    oldUserPassword,
    userPassword
  })
}

/**
 * 获取地址列表
 */
export const getAreaDataApi = () => {
  return post<any>('area-data')
}
