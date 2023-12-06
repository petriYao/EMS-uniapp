import { useAxios } from '@/hooks/useAxios'
import { MeetingReservationUpdateType } from '@/types/userModel'

const { post } = useAxios()

/**会议室列表 */
export const MeetingRoomList = (data: any) => {
  return post<any>('meeting-room/list', { ...data })
}

/**会议室详情 */
export const MeetingRoomInfo = (meetingRoomId: any) => {
  return post<any>('meeting-room/info', { meetingRoomId })
}

/**时间状态列表 */
export const MeetingReservationTimeList = (meetingRoomId: any, date: any) => {
  return post<any>('meeting-reservation/time-list', { meetingRoomId, date })
}

/**会议预约添加编辑 */
export const MeetingReservationUpdate = (
  data: MeetingReservationUpdateType,
  meetingReservationId?: number
) => {
  if (meetingReservationId) {
    return post<any>('meeting-reservation/update', { ...data, meetingReservationId })
  } else {
    return post<any>('meeting-reservation/add', { ...data })
  }
}

/**会议预约列表 */
export const MeetingReservationList = (data: any) => {
  return post<any>('meeting-reservation/list', { ...data })
}

/**会议预约详情 */
export const MeetingReservationInfo = (meetingReservationId: any) => {
  return post<any>('meeting-reservation/info', { meetingReservationId })
}
