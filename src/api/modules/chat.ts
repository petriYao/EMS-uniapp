import { useAxios } from '@/hooks/useAxios'
import { ReplyAddType, ReplyListType } from '@/types/userModel'

const { post } = useAxios()

/**添加 */
export const ReplyAdd = (data: ReplyAddType) => {
  return post<any>('reply/add', { ...data })
}

/**列表 */
export const ReplyList = (data: ReplyListType) => {
  return post<any>('reply/list', { ...data })
}
/**自动回复列表 */
export const ReplyAutomaticList = (replyType: number) => {
  return post<any>('reply/automatic-list', { replyType })
}
