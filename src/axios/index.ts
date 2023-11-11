import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import axios from 'axios'

import { Encrypt, Decrypt } from '@/utils/aesUtils'
import { getHttpHeader, getIsPublic } from '@/utils/httpUtils'
import { showApiLog, isString } from '@/utils'
import { showError, showNoLogin } from '@/hooks/useModal'
import { getPathUrl, isDebug } from '@/config/config'
import { ResponseDataType, result_code_no_login, result_code_success } from '@/types/httpModel'

type ParamsSerializer = AxiosRequestConfig['paramsSerializer']

const getFullURL = (
  baseURL: string,
  url: string,
  _params: Record<string, any>,
  _paramsSerializer?: ParamsSerializer
) => {
  return `${baseURL}${url}`
}

/**
 * 创建网络
 */
const service = axios.create({
  baseURL: getPathUrl(),
  withCredentials: false,
  //替换
  adapter(config: InternalAxiosRequestConfig<any>) {
    showApiLog('request =>', config.url, config.data)
    //头部
    const headers = getHttpHeader(getIsPublic(config.url))
    //数据类型
    headers['Accept'] =
      'application/json ,application/x-www-form-urlencoded ,text/plain,multipart/form-data, */*'

    // 不缓存get请求
    if (config.method === 'get') {
      headers['Cache-Control'] = 'no-cache'
    }

    // delete请求参数放入body中
    if (config.method === 'delete') {
      headers['Content-type'] = 'application/json;'
      Object.assign(config, {
        data: config.params,
        params: {}
      })
    }

    //数据处理
    if (config.method === 'post') {
      if (config.data && config.data.commonUploadFile) {
        headers['Content-Type'] = 'multipart/form-data;charset=utf-8'
        config.data = config.data.commonUploadFile
      } else {
        headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
        //加密数据
        if (config.data && !isDebug()) {
          const encryptedData = Encrypt(
            isString(config.data) ? config.data : JSON.stringify(config.data),
            getIsPublic(config.url)
          )
          config.data = { encryptedData }
        }
      }
    }

    const { url, method, data, params, baseURL, paramsSerializer } = config

    return new Promise((resolve, reject) => {
      uni.request({
        method: method!.toUpperCase() as any,
        url: getFullURL(baseURL || '', url!, params, paramsSerializer),
        header: headers,
        data,
        dataType: 'json',
        responseType: config.responseType,
        success: (res: UniNamespace.RequestSuccessCallbackResult) => {
          resolve({
            data: res.data,
            status: res.statusCode,
            statusText: '',
            headers: config.headers,
            config: config
          })
        },
        fail: (err: UniNamespace.GeneralCallbackResult) => {
          reject({ message: err.errMsg })
        }
      })
    })
  }
})

/**
 * 响应拦截
 */
service.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    if (response.status != 200) {
      return Promise.reject(response)
    }
    const url = response.config.url ?? ''
    const responseData = response.data as ResponseDataType
    //未登录
    if (responseData.code === result_code_no_login) {
      //扫码提示
      if (url === 'qrcode/scan-code-form') {
        responseData.message = '牵手客户，加入公司需登录，是否登录？'
      } else {
        responseData.message = responseData.message ?? '未登录，是否登录?'
      }
      //跳转重新登录
      showNoLogin(responseData.message)
      return responseData as any
    }
    //未成功显示错误
    if (!responseData.success) {
      showError(responseData?.message ?? '网络错误')
    }
    //成功解析加密数据
    if (responseData.success) {
      if (responseData.encrypted && responseData.code === result_code_success) {
        try {
          let isPublic = getIsPublic(url)
          if (!isPublic) {
            switch (url) {
              case 'company/company-change':
              case 'company/company-add':
              case 'wx-bind-account':
                isPublic = true
                break
            }
          }
          const encryptedData = Decrypt(responseData.encrypted, isPublic)
          responseData.value = JSON.parse(encryptedData)
        } catch (e) {
          showError('网络数据解析错误！')
        }
      }
    }
    showApiLog('response =>', url, responseData)
    return responseData as any
  },
  (error: AxiosError) => {
    // 异常的请求返回处理
    return Promise.reject(error)
  }
)

export default service
