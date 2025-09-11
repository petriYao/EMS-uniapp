import { lookBarCode, queryBarCode } from '@/api/modules/storage'
import { lookOtherOutbound } from '@/api/modules/transferOrder'
import { executeBillQueryApi, saveApi } from '@/api/commonHttp'

//其他出库-扫描单号
export const getOtherCase = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await lookOtherOutbound(searchValue)
  console.log('条码单数据', res.data)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '其他出库单不存在',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    if (res.data.Result?.Result?.DocumentStatus === 'C') {
      uni.showToast({
        title: '单据已审核',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    fid = res.data.Result.Result.Id
    const TreeEntity = res.data.Result.Result.BillEntry
    console.log('生产订单属性', TreeEntity)
    for (const item of TreeEntity) {
      console.log('item', item, item.CustId)
      const data = {
        currentList: [
          {
            label: '部门',
            value: res.data.Result.Result.DeptId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },

          {
            label: '编码',
            value: item.MaterialId.Number,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '名称',
            value: item.MaterialId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '规格',
            value: item.MaterialId.MultiLanguageText[0].Specification,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '批号',
            value: item.Lot_Text,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },

          {
            label: '合同',
            value: item.F_QADV_HTNO,
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },
          {
            label: '批量',
            value: null,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          },

          {
            label: '客户',
            value: item.F_QADV_KH?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },
          {
            label: '总箱数',
            value: null,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          },

          {
            label: '可发',
            value: item.Qty,
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },
          {
            label: '单位',
            value: item.UnitID?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          }
        ],
        detailList: {
          //编码，批号，名称，规格，可退，数量，仓位，件数
          fnumber: item.MaterialId.Number, //编码
          lot: item.Lot_Text, //批号
          name: item.MaterialId?.Name[0].Value, //名称
          specification: item.MaterialId.MultiLanguageText[0].Specification, //规格
          receivableQuantity: item.Qty, //可退
          quantity: 0 //数量
        },
        barcodeList: [],
        entryId: item.Id,
        //是否第一次扫描条码
        isLowerCamelCase: true,
        //是否整数
        isInteger: true,
        //物料编码
        MaterialCode: item.MaterialId.Number,
        //批号
        Lot: item.Lot_Text === ' ' ? '' : item.Lot_Text,
        //名称
        Name: item.MaterialId?.Name[0].Value,
        //规格型号
        Specification: item.MaterialId.MultiLanguageText[0].Specification,
        //件数
        Quantity: 0,
        //数量
        Quantity2: 0,
        WarehouseNumber: item.STOCKID?.Number,
        //部件单位用量
        UnitQty: '',
        //可退货数量
        canReceive: item.Qty,
        Unit: item.UnitID?.Name[0].Value,
        IsSplit: false,
        FZLOTList: [],
        packagingDataFZLOT: {} as any
      }
      dataList.push(data)
    }
  }
  console.log('生产入库明细数据', dataList)

  return { dataList, fid }
}

// 其他出库-扫描条码
export const otherScanBarcode = async (searchValue: any) => {
  const res = await lookBarCode(searchValue)
  if (res && res.data) {
    //条码详情
    const barCodeData = res.data.Result.Result
    console.log('条码信息', barCodeData)
    ///条码单不存在
    if (barCodeData == null) {
      uni.showToast({
        title: '条码单不存在',
        icon: 'none'
      })
      return null
    }
    //条码禁用
    if (barCodeData.ForbidStatus === 'B') {
      uni.showToast({
        title: '条码单已作废',
        icon: 'none'
      })
      return null
    }
    //条码未审核
    if (barCodeData.DocumentStatus !== 'C') {
      uni.showToast({
        title: '条码未审核',
        icon: 'none'
      })
      return null
    }
    //条码类型为唯一
    if (barCodeData.F_BARTYPE === '2') {
      uni.showToast({
        title: '条码类型非唯一',
        icon: 'none'
      })
      return null
    }
    //条码为入库状态
    if (barCodeData.F_BARSTATUS != 2) {
      uni.showToast({
        title: '条码非入库状态',
        icon: 'none'
      })
      return null
    }

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
    console.log('packData', packData)

    const stockLoc = packData?.F_QADV_STOCKLOCID
    let actualValue = null

    // 获取对象的所有 key
    const FStockLocId = {} as any
    // 找到第一个 F10000x 字段，且其值不为 null
    if (stockLoc != null) {
      const keys = Object.keys(stockLoc)

      for (const key of keys) {
        if (
          key.startsWith('F10000') &&
          stockLoc[key] !== null &&
          typeof stockLoc[key] === 'object'
        ) {
          FStockLocId[`FSTOCKLOCID__F` + key] = {
            Fnumber: stockLoc[key].Number
          }
          actualValue = stockLoc[key]
          break
        }
      }
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
        STOCKLOCName: actualValue?.Name?.[0]?.Value, //仓位
        STOCKLOCNumber: actualValue?.Number,
        FStockLocId: FStockLocId,
        F_QADV_FSTOCKID: packData.F_QADV_FSTOCKID_Id, //仓库ID
        F_QADV_STOCKLOCID: packData.F_QADV_STOCKLOCID_Id, //仓位ID
        FZLOT: barCodeData.F_QADV_FZLOT, //分装编码
        FLot: barCodeData.F_WLLOT //批次
      },
      //供应商
      Supplier: barCodeData.F_QADV_GYS?.Name[0].Value,
      //生产部门
      ProductionDepartment: barCodeData.F_ALMA_BM?.Number,
      //条码单编码
      BarCode: searchValue,
      //物料编码
      MaterialCode: barCodeData.F_NUMBER.Number,
      //批号
      Lot: barCodeData.F_WLLOT === ' ' ? '' : barCodeData.F_WLLOT,
      //名称
      Name: barCodeData.F_NUMBER.Name[0].Value,
      //规格型号
      Specification: barCodeData.F_NUMBER.MultiLanguageText[0].Specification,
      //是否整数
      isInteger: !barCodeData.F_CHECKBOXFZ,
      //原数量
      Quantity: barCodeData.F_CHECKBOXFZ ? 0 : barCodeData.F_UNITQTY,
      //现数量
      Quantity2: barCodeData.F_CHECKBOXFZ ? 0 : barCodeData.F_UNITQTY,
      //当前条码数量
      CurrentQty: barCodeData.F_UNITQTY,
      //是否分装
      IsSplit: barCodeData.F_CHECKBOXFZ,
      //分装编号
      SplitCode: barCodeData.F_FZNO,
      //仓库
      WarehouseNumber: '',
      //部件单位用量
      unitQty: barCodeData.F_JUNITQTY,
      //分装数量
      SplitValue: barCodeData.F_UNITQTY,
      //总箱数
      TotalBox: barCodeData.F_TOTALCARTONQTY,
      //批量
      F_POQTY: barCodeData.F_POQTY,
      //分装批次号
      FZLOTList: [barCodeData.F_QADV_FZLOT],
      packagingDataFZLOT: {} as any
    }
    data.packagingDataFZLOT[barCodeData.F_QADV_FZLOT] = {
      //分装批次号
      packagingData: packagingData,
      packagingSig: packagingSig,
      isInteger: false,
      FZquantity: 0
    }
    console.log('扫描条码2222', data)

    return data
  }
}

//其他出库单据查询
export function queryPurchaseReturn(FormId: string, FilterString: string, FieldKeys: string) {
  const data = {
    parameters: [
      {
        FormId: FormId,
        FieldKeys: FieldKeys,
        FilterString: FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  console.log('提货单数据', data)
  return executeBillQueryApi(data)
}

//其他出库单保存
export function savePurchaseReturn(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'STK_MisDelivery',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}
//生产领料单保存
export function saveMaterialRequisition(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'PRD_PickMtrl',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}
//简单生产领料单保存
export function saveSimpleMaterialRequisition(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'SP_PickMtrl',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}
//委外生产领料单保存
export function saveOutsourceMaterialRequisition(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'SUB_PickMtrl',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//生产退料单保存
export function saveMaterialReturn(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'PRD_ReturnMtrl',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//简单生产退料单保存
export function saveSimpleMaterialReturn(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'SP_ReturnMtrl',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//委外退料单保存
export function saveOutsourceMaterialReturn(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'SUB_RETURNMTRL',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//储位保存
export function saveLocation(Model: any) {
  const data = {
    formid: 'QADV_CWB',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: false,
      Model: Model
    }
  }
  return saveApi(data) as any
}
