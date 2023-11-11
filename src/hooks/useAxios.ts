import service from '@/axios'
import { ResponsePromise } from '@/types/httpModel'
import { hideLoading, showLoading } from '@/hooks/useModal'

export const useAxios = () => {
  //post
  const post = <T>(url: string, data?: any, showLoaded = true): ResponsePromise<T> => {
    if (showLoaded) showLoading()
    return service.post(url, data).finally(() => {
      if (showLoaded) hideLoading()
    }) as unknown as ResponsePromise<T>
  }

  //post
  const postNoShowLoading = <T>(url: string, data?: any): ResponsePromise<T> => {
    return post(url, data, false)
  }

  return {
    post,
    postNoShowLoading
  }
}
