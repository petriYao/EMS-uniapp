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
  return post<AppSetListType>('app/app-list', { name, page, size })
}

/**
 * 显示详情
 */
export const AppSetInfoApi = (name: string) => {
  return post<AppSetInfoType>('app/app-info', { name })
}

/**
 * 显示详情
 */
export const AppSetListInfo = (id: string) => {
  return post<AppSetInfoType>('app/app-list-info', { id })
}
