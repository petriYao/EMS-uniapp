import { useAxios } from '@/hooks/useAxios'

const { post } = useAxios()

/**列表 */
export const ProductListApi = (data: any) => {
  return post<any>('product/list', { ...data })
}

/**看房预约列表 */
export const HouseReservationList = (data: any) => {
  console.log('data', data)
  return post<any>('house-reservation/list', { ...data })
}

/**房屋列表 */
export const HouseList = (data: any, tabActive: number) => {
  if (tabActive === 1) {
    return post<any>('house/list', { ...data })
  } else {
    return post<any>('house-reservation/list', { ...data })
  }
}
/**房屋列表 */
export const HouseInfo = (houseId: any) => {
  return post<any>('house/info', { houseId })
}

/**看房预约添加编辑 */
export const HouseReservationUpdate = (data: any, houseReservationId: string) => {
  if (houseReservationId) {
    return post<any>('house-reservation/update', { ...data, houseReservationId })
  } else {
    return post<any>('house-reservation/add', { ...data })
  }
}
