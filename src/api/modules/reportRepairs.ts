import { useAxios } from '@/hooks/useAxios'
import { ReportRepairsInfoType, ReportRepairsListType } from '@/types/reportRepairsModel'

const { post } = useAxios()

/**
 * 添加报事报修
 */
export const ReportRepairsAddApi = (data: any, reportRepairsId?: number) => {
  return post<any>(`report-repairs/${reportRepairsId ? 'update' : 'add'}`, {
    ...data,
    reportRepairsId
  })
}

/**报事报修列表 */
export const ReportRepairsListApi = (reportRepairsStatus: number, page?: number, size?: number) => {
  return post<{ list: ReportRepairsListType[]; total: number; page: number; size: number }>(
    'report-repairs/list',
    { reportRepairsStatus, page, size }
  )
}

/**报事报修删除 */
export const ReportRepairsDelete = (reportRepairsId: number) => {
  return post<ReportRepairsInfoType>('report-repairs/delete', { reportRepairsId })
}

/**报事报修详情 */
export const ReportRepairsInfoApi = (reportRepairsId: number) => {
  return post<ReportRepairsInfoType>('report-repairs/info', { reportRepairsId })
}
