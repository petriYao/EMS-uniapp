import { lookPickupOrder } from '@/api/modules/lowerCamelCase'
import { SalesOutboundType } from '@/types/LowerCamelCaseType'
import { lookBarCode, queryBarCode } from '@/api/modules/storage'
/*提货单内容*/
export const getPickupOrder = async (searchValue: any) => {
  const dataList = [] as SalesOutboundType[]

  let model = {} as any
  const res = await lookPickupOrder(searchValue)
  console.log('提货单数据', res.data)

  if (res && res.data) {
    console.log('提货单数据2', res.data.Result?.ResponseStatus?.IsSuccess)
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '提货单不存在',
        icon: 'none'
      })
      return { dataList: [] }
    }
    if (res.data.Result?.Result?.DocumentStatus !== 'C') {
      uni.showToast({
        title: '提货单未审核',
        icon: 'none'
      })
      return { dataList: [] }
    }
    const PickupOrder = res.data.Result.Result
    const TreeEntity = res.data.Result.Result.SAL_DELIVERYNOTICEENTRY

    console.log('生产订单属性', TreeEntity)
    for (const item of TreeEntity) {
      console.log('单据体', item)
      if (item.Qty - item.SumOutQty > 0) {
        const data = {
          currentList: [
            {
              label: '序号',
              value: item.Seq,
              disabled: true,
              type: 'input',
              style: { width: '100%' }
            },
            {
              label: '合同',
              value: item.OrderNo + '-' + item.OrderSeq,
              disabled: true,
              type: 'input',
              style: { width: '100%' }
            },
            {
              label: '编码',
              value: item.MaterialID.Number,
              disabled: true,
              type: 'input',
              style: { width: '100%' }
            },
            {
              label: '名称',
              value: item.MaterialID.Name[0].Value,
              disabled: true,
              type: 'input',
              style: { width: '100%' }
            },
            {
              label: '规格',
              value: item.MaterialID.MultiLanguageText[0].Specification,
              disabled: true,
              type: 'input',
              style: { width: '100%' }
            },

            {
              label: '订单数',
              value: item.StockBaseDen,
              disabled: true,
              type: 'input',
              style: { width: '50%' }
            },

            {
              label: '单位',
              value: item.BaseUnitID.Name[0].Value,
              disabled: true,
              type: 'input',
              style: { width: '50%' }
            },
            {
              label: '应发数',
              value: item.Qty,
              disabled: true,
              type: 'input',
              style: { width: '50%' }
            },

            {
              label: '累计实发',
              value: item.SumOutQty,
              disabled: true,
              type: 'input',
              style: { width: '50%' }
            },
            {
              label: '未发数',
              value: item.Qty - item.SumOutQty,
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
          ],
          FEntity_model: {
            FMaterialID: { FNumber: item.MaterialID.Number }, //物料编码
            FRealQty: 0, //实发数量**
            FMustQty: item.RemainOutQty, //应发数量
            FBaseMustQty: item.RemainOutQty, //应发基数
            FNote: item.NoteEntry, //备注
            FStockID: { FNumber: '205' }, //仓库**
            FStockLocId: {
              //仓位**
              FSTOCKLOCID__FF100001: {
                FNumber: '102'
              }
            },
            FSRCTYPE: 'SAL_DELIVERYNOTICE', //源单类型
            FSRCBILLNO: PickupOrder.BillNo, //源单编号
            F_QADV_YDENTRYID: item.Seq, //源单行号
            FSoorDerno: item.OrderNo, //销售订单单号
            F_QADV_POENTRYID: Number(item.OrderSeq), // 销售订单行号
            FSOEntryId: item.SOEntryId, //销售订单EntryId
            FEntity_Link: [
              {
                FEntity_Link_FRULEID: 'DeliveryNotice-OutStock', //转换规则
                FEntity_Link_FSTABLENAME: 'T_SAL_DELIVERYNOTICEENTRY', //源单表名
                FEntity_Link_FSBILLID: PickupOrder.Id, //源单内码（FID）
                FEntity_Link_FSID: item.Id, //单据体内码
                FEntity_Link_FBaseUnitQty: 0, //库存基本数量（单据体-库存基本数量）**
                FEntity_Link_FBaseUnitQtyOld: item.RemainOutQty, //库存基本数量（原始携带量）
                FEntity_Link_FSalBaseQty: 0, //销售基本数量（单据体-销售基本数量）**
                FEntity_Link_FSalBaseQtyOld: item.RemainOutQty, //销售基本数量（原始携带量）
                FEntity_Link_FPriceBaseQty: 0, //计价基本数量（单据体-计价基本数量）**
                FEntity_Link_FPriceBaseQtyOld: item.RemainOutQty //计价基本数量（原始携带量）
              }
            ]
          },
          //条码列表
          barcodeList: [],
          F_QADV_MARK: item.F_QADV_ZMAI, //正唛
          number: item.MaterialID.Number, //产品编码
          fname: item.MaterialID.Name[0].Value, //产品名称
          id: item.Id,
          //销售订单号
          OrderNo: item.OrderNo,
          IsSplit: false, //是否分装
          isInteger: true, //是否整数
          //销售订单行号
          OrderSeq: Number(item.OrderSeq),
          //应发数量
          shouldSendQuantity: item.Qty,
          //累计实发
          cumulativeAct: item.SumOutQty,

          cumulativeActualSend: item.SumOutQty,
          //本次合计
          currentTotal: 0,
          //分装批次号
          FZLOTList: [], //储存分装批次
          packagingDataFZLOT: {} as any //储存分装明细的成品计算
        } as SalesOutboundType
        dataList.push(data)
        console.log('生产入库明细数据', data)
      }
    }

    model = {
      FBillTypeID: { FNUMBER: 'XSCKD01_SYS' }, //单据类型
      FStockOrgId: { FNumber: '100' }, //发货组织
      FSaleOrgId: { FNumber: '100' }, //销售组织
      FOwnerIdHead: { FNumber: '100' }, //货主
      FCorrespondOrgId: { FNumber: '100' }, //结算组织
      FSaleDeptID: { FNumber: PickupOrder.SaleDeptID?.Number }, //销售部门
      FCustomerID: { FNumber: PickupOrder.ReceiverID?.Number }, //客户
      FSalesManID: { FNumber: PickupOrder.SalesManID?.Number }, //销售人员
      SubHeadEntity: {
        FSettleCurrID: { FNumber: PickupOrder.SAL_DELIVERYNOTICEFIN[0].SettleCurrID?.Number }, //结算币别
        FSettleOrgID: { FNumber: PickupOrder.SAL_DELIVERYNOTICEFIN[0].SettleOrgID?.Number } //结算组织
      },
      FEntity: []
    }
  }
  return { dataList, model }
}

export const productionGetData = async (searchValue: any) => {
  const res = await lookBarCode(searchValue)
  if (res && res.data) {
    //条码-明细
    const barCodeData = res.data.Result.Result
    console.log('条码数据', barCodeData)
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
    if (barCodeData.F_BARTYPE !== '1') {
      uni.showToast({
        title: '条码类型非唯一',
        icon: 'none'
      })
      return null
    }
    if (barCodeData.F_BARSTATUS !== '2') {
      uni.showToast({
        title: '条码非入库状态',
        icon: 'none'
      })
      return null
    }

    /**分装信息 ***********************************************/
    const packagingData = {} as any
    const packagingSig = [] as string[] //分装编号

    //根据分装批次号找到 生成条码单的数据
    if (barCodeData.F_CHECKBOXFZ) {
      const res: any = await queryBarCode(barCodeData.F_QADV_FZLOT)
      if (res && res.data && res.data.length > 0) {
        //条码单数据
        for (const item of res.data) {
          packagingData[item[0]] = {
            //数量
            quantity: 0,
            // 单位用量
            unitQty: 0,
            //成品数量
            finishedQty: 0
          }
          //重复的不要
          if (!packagingSig.includes(item[0])) {
            packagingSig.push(item[0])
          }
        }
      }
      packagingData[barCodeData.F_FZNO].quantity = barCodeData.F_UNITQTY
      packagingData[barCodeData.F_FZNO].unitQty = barCodeData.F_JUNITQTY
      packagingData[barCodeData.F_FZNO].finishedQty = barCodeData.F_UNITQTY / barCodeData.F_JUNITQTY
    }

    let packData = {} as any
    //条码单的单据体
    if (barCodeData.F_QADV_BARCODEENTRY.length > 0) {
      packData = barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1]
    }

    const data = {
      barcodeList: {
        FNumber: barCodeData.Number, //编码
        quantity: barCodeData.F_UNITQTY, //数量
        subPackageNo: barCodeData.F_FZNO, //分装编号
        partNumberName: barCodeData.F_BJNAME, //部件名称
        unitQuantity: barCodeData.F_JUNITQTY, //单位用量
        FSTOCKName: packData?.F_QADV_FSTOCKID?.Name?.[0]?.Value, //仓库
        FSTOCKNumber: packData?.F_QADV_FSTOCKID?.Number,
        STOCKLOCName: packData?.F_QADV_STOCKLOCID?.F100001?.Name?.[0]?.Value, //仓位
        STOCKLOCNumber: packData?.F_QADV_STOCKLOCID?.F100001?.Number,
        FZLOT: barCodeData.F_QADV_FZLOT, //分装编码
        FLot: barCodeData.F_WLLOT //批次
      },
      /**用来判断是否添加 */
      Fnumber: barCodeData.F_NUMBER.Number,
      OrderNo: barCodeData.F_HTNO, //合同
      OrderSeq: barCodeData.F_QADV_HTENTRYID, //合同行号

      /**条码分装数据 */
      IsSplit: barCodeData.F_CHECKBOXFZ, //是否分装
      FZLOT: barCodeData.F_QADV_FZLOT, //条码批次号
      packagingData,
      packagingSig
    }

    return data
  }
}
