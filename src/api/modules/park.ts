import { useAxios } from '@/hooks/useAxios'
import { AppSetInfoType, AppSetListType } from '@/types/commonModel'

const { post } = useAxios()

/**
 * 显示列表
 * @param name
 * @param page
 * @param size
 * @returns
 */
export const AppSetListApi = (name: string, page?: number, size?: number) => {
  return post<AppSetListType>('app-set/app-set-list', { name, page, size })
}

/**
 * 显示详情
 */
export const AppSetInfoApi = (name: string) => {
  return post<AppSetInfoType>('app-set/app-set-info', { name })
}
