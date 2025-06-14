import { QueryCheckoutTime } from '@/api/commonHttp'
import { salesOrder, lookSalesOrder, pickupOrder, lookBarCode } from '@/api/modules/lowerCamelCase'
import {
  shipmentSubContainer,
  lookShipmentSubContainer,
  shipmentSubContainerSave
} from '@/api/modules/lowerCamelCase'
/**
 * 查看条码是否存在与提货单中（单据查询销售出库，按提货单号+柜号+编码）
 * 储存出库单号
 * 根据单据查询返回的出库单号调用查看出库单接口
 */
export const productionGetData = async (
  searchValue: any,
  pickupOrderValue: any,
  containerNoValue: any
) => {
  const BarCoderes: any = await lookBarCode(searchValue)
  if (BarCoderes && BarCoderes.data) {
    //条码-明细
    const barCodeData = BarCoderes.data.Result.Result
    console.log('条码-明细', barCodeData)
    if (barCodeData == null) {
      uni.showToast({
        title: '条码单不存在',
        icon: 'none'
      })
      return null
    }
    if (barCodeData.ForbidStatus === 'B') {
      uni.showToast({
        title: '条码单已作废',
        icon: 'none'
      })
      return null
    }
    if (barCodeData.DocumentStatus !== 'C') {
      uni.showToast({
        title: '条码未审核',
        icon: 'none'
      })
      return null
    }
    if (barCodeData.F_BARSTATUS !== '3') {
      uni.showToast({
        title: '条码非出库状态',
        icon: 'none'
      })
      return null
    }
    if (
      barCodeData.F_QADV_BARCODEENTRY.length === 0 ||
      barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1].F_QADV_TYPE !==
        '销售出库单'
    ) {
      uni.showToast({
        title: '该条码有关联下游单据，无法撤销',
        icon: 'none'
      })
      return null
    }
    if (barCodeData.CreateDate) {
      const Timeres: any = await QueryCheckoutTime(barCodeData.CreateDate)
      console.log('查询时间', Timeres)
      if (Timeres && Timeres.data === 'False') {
        uni.showToast({
          title: '不允许撤销当期以前的单据',
          icon: 'none'
        })
        return null
      }
    }
  }
  //单据查询销售出库，按提货单号+柜号+编码
  const res = await salesOrder(
    ` F_BARCODENO = '${searchValue}' AND FSrcBillNo='${pickupOrderValue}' AND F_QADV_FGH='${containerNoValue}' `
  )
  console.log('单据查询销售出库，按提货单号+柜号+编码', res.data)
  if (res.data.length === 0) {
    uni.showToast({
      title: '条码与出运分柜单不符',
      icon: 'none'
    })
    return
  }
  //查看提货单，获取关联出库数量，出货数量（单据编号，条码编号）
  const pickupOrderRes: any = await pickupOrder(
    `FBillNo = '${pickupOrderValue}' AND FEntity_FEntryID = '${res.data[0][3]}' `,
    'FQty,FJoinOutQty'
  )
  console.log('提货单，获取关联出库数量，出货数量', pickupOrderRes.data[0])
  //查看出库单
  const lookRes: any = await lookSalesOrder(res.data[0][0])

  const ckData = lookRes.data.Result.Result
  console.log('查看出库单', ckData)

  const lowerCamelCaseList = {
    currentList: [] as any,
    barcodeList: [] as any,
    FENTRYID: 0,
    warehouse: '',
    location: ''
  }
  //保存出库单
  const Model = {
    FID: ckData.Id,
    FEntity: [] as any
  }
  for (const SALitem of ckData.SAL_OUTSTOCKENTRY) {
    Model.FEntity.push({
      FENTRYID: SALitem.Id,
      FSALUNITQTY: SALitem.RealQty,
      F_QADV_XSCKSubEntity: SALitem.F_QADV_XSCKSubEntity
    })
  }
  const index = ckData.SAL_OUTSTOCKENTRY.findIndex((item: any) => item.Id == res.data[0][1])
  let isFE = false
  if (index !== -1) {
    console.log('index', ckData.SAL_OUTSTOCKENTRY[index])
    console.log('错误', ckData.SAL_OUTSTOCKENTRY[index].StockLocID)
    lowerCamelCaseList.FENTRYID = ckData.SAL_OUTSTOCKENTRY[index].Id
    lowerCamelCaseList.warehouse = ckData.SAL_OUTSTOCKENTRY[index].StockID.Name[0].Value
    lowerCamelCaseList.location = ckData.SAL_OUTSTOCKENTRY[index].StockLocID?.F100001?.Name[0].Value
    lowerCamelCaseList.currentList = [
      {
        label: '条码',
        value: ckData.BillNo,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '合同',
        value:
          ckData.SAL_OUTSTOCKENTRY[index].SoorDerno +
          '-' +
          ckData.SAL_OUTSTOCKENTRY[index].F_QADV_POENTRYID,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '客户',
        value: ckData.CustomerID.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '编码',
        value: ckData.SAL_OUTSTOCKENTRY[index].MaterialID.Number,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '名称',
        value: ckData.SAL_OUTSTOCKENTRY[index].MaterialID.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '规格',
        value: ckData.SAL_OUTSTOCKENTRY[index].MaterialID.MultiLanguageText[0].Specification,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },

      {
        label: '订单数',
        value: pickupOrderRes.data[0][0],
        disabled: true,
        type: 'input',
        style: { width: '50%' }
      },

      {
        label: '单位',
        value: ckData.SAL_OUTSTOCKENTRY[index].SalUnitId.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '50%' }
      },
      {
        label: '已发数',
        value: pickupOrderRes.data[0][1],
        disabled: true,
        type: 'input',
        style: { width: '50%' }
      },
      {
        label: '本次件数',
        value: 0,
        disabled: true,
        type: 'input',
        style: { width: '50%' }
      }
    ]
    isFE = ckData.SAL_OUTSTOCKENTRY[index].F_QADV_XSCKSubEntity[0].F_JUNITQTY > 0
  }
  //仓库仓位
  console.log('Model', Model)
  const data = {
    Model, //提交数据
    lowerCamelCaseList: lowerCamelCaseList,
    isFE: isFE //是否分装
  }
  //删除Model.FEntity[0].F_QADV_XSCKSubEntity中F_BARCODENO=searchValue的值
  // Model.FEntity[0].F_QADV_XSCKSubEntity = Model.FEntity[0].F_QADV_XSCKSubEntity.filter(
  //   (item: any) => item.F_BARCODENO !== searchValue
  // )

  // console.log('Model', Model)
  // const saveRes = await saveSalesOrder(Model, false)
  // console.log('保存出库单', saveRes)
  return data
}

/**修改出运分柜 */
export async function changeOutbound(
  pickupOrderValue: any,
  containerNoValue: any,
  number: string,
  num: number
) {
  console.log('修改出运分柜', pickupOrderValue, containerNoValue, number, num)
  //单据查询哪张分柜单
  const res: any = await shipmentSubContainer(
    `F_QADV_THDNO_LSN = '${pickupOrderValue}' AND F_QADV_FGH ='${containerNoValue}' and F_QADV_NUMBER.fnumber = '${number}'`
  )
  console.log('分柜单查询结果', res)
  if (res.data.length > 0) {
    const lookRes: any = await lookShipmentSubContainer(res.data[0][0])
    const ckData: any = lookRes.data.Result.Result
    console.log('出运分柜查看结果', ckData)
    const Model = {
      FID: ckData.Id,
      FEntity: [] as any
    }
    for (const SALitem of ckData.QADV_THDFGEntry) {
      console.log('SALitem', res.data[0][6] == SALitem.Id, res.data[0][6], SALitem.Id)
      if (res.data[0][6] == SALitem.Id) {
        if (SALitem.F_QADV_QTY - num > 0) {
          Model.FEntity.push({
            FENTRYID: SALitem.Id,
            F_QADV_QTY: SALitem.F_QADV_QTY - num
          })
        }
      } else {
        Model.FEntity.push({
          FENTRYID: SALitem.Id,
          F_QADV_QTY: SALitem.F_QADV_QTY
        })
      }
    }
    //保存分柜单
    const fgres = await shipmentSubContainerSave(Model, false)
    console.log('修改出运分柜', fgres)
  }
  return res
}
