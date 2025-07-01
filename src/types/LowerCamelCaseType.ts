export type CurrentType = {
  label: string
  value: any
  disabled: boolean
  type: string
  style: { width: string }
}

//销售出库
export type SalesOutboundType = {
  currentList: CurrentType[]
  barcodeList: any[]
  FZLOTList: string[]
  packagingDataFZLOT: any
  F_QADV_MARK: string
  number: string
  fname: string
  IsSplit: boolean
  isInteger: boolean
  shouldSendQuantity: number
  cumulativeAct: number
  cumulativeActualSend: number
  currentTotal: number
}

//出库撤销
export type SalesOutboundCancelType = {
  currentList: CurrentType[]
  barcodeList: any[]
  packagingData: any
  packagingSig: any[]
  pickupOrderValue: string
  containerNoValue: number
  //仓库
  warehouse: string
  //仓位
  location: string
  FENTRYID: number
  isInteger: boolean
  isFE: boolean
  FRealQty: number
}
