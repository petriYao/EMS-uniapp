import { useAxios } from '@/hooks/useAxios'
import { ReportRepairsInfoType } from '@/types/reportRepairsModel'

const { post } = useAxios()

/**列表 */
export const ProductListApi = (data: any) => {
  return post<any>('product/list', { ...data })
}
