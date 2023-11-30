import { useAxios } from '@/hooks/useAxios'
import { AppSetInfoType, AppSetListType } from '@/types/commonModel'

const { post } = useAxios()

/**
 * 添加报事报修
 */
export const addReportRepairs = (data: any) => {
  console.log('添加报事报修内容', data)
  return post<AppSetInfoType>('report-repairs/add', { ...data })
}
