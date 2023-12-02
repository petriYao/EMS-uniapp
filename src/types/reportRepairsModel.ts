import { productImageType } from './commonModel'

export type ReportRepairsListType = {
  contentList: ContentListType[]
  createdAt: string
  reportRepairsId: number
  reportRepairsStatus: number
  reportRepairsStatusTitle: string
  reportRepairsType: number
  reportRepairsTypeTitle: string
}

export type ContentListType = {
  label: string
  type: number
  value: string
}

export type ReportRepairsInfoType = {
  contactName: string
  contactPhone: string
  content: string
  imageArray: productImageType[]
  imageIdArray: string
  position: string
  reportRepairsId: number
  reportRepairsType: number
  reservationAt: string
}
