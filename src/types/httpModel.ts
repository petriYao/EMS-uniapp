//网络返回数据接口
export interface ResponseDataType<T = any> {
  success: boolean
  message: string
  code: number
  value?: T
  encrypted?: string
}

export type ResponsePromise<T = any> = Promise<ResponseDataType<T>>

/**
 * 接口成功返回状态码
 */
export const result_code_success = 1
/**
 * 接口成功返失败
 */
export const result_code_fail = 1000
/**
 * 未登入
 */
export const result_code_no_login = 2001
/**
 * 需重新登入
 */
export const result_code_no_register = 2002
/**
 * 版本太低
 */
export const result_code_version_error = 2006
/**
 * 无权限
 */
export const result_code_no_permission = 3001
