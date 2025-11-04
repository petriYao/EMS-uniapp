import { lookBarCode, queryBarCode } from '@/api/modules/storage'
import { getSalesReturn } from '@/api/modules/transferOrder'
// 采购入库-扫描条码
export const purchaseScanBarcode = async (searchValue: any, setData: any) => {
  const res = await lookBarCode(searchValue)
  if (res && res.data) {
    //条码详情
    const barCodeData = res.data.Result.Result
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
    if (barCodeData.F_BARSTATUS != 1) {
      uni.showToast({
        title: '条码非创建状态',
        icon: 'none'
      })
      return null
    }

    //源单类型非生产订单
    // if (barCodeData.F_YVRT_YDLX !== '生产订单') {
    //   uni.showToast({
    //     title: '源单类型非生产订单',
    //     icon: 'none'
    //   })
    //   return null
    // }
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

    const data = {
      barcodeList: [
        {
          F_BARCODENO: barCodeData.Number, //条码单号
          F_UNITQTY: barCodeData.F_UNITQTY, //每箱数量
          F_FZNO: barCodeData.F_FZNO, //分装编号
          F_BJNAME: barCodeData.F_BJNAME, //部件名称
          F_JUNITQTY: barCodeData.F_JUNITQTY, //部件用量
          F_QADV_NBZQTY: barCodeData.F_QADV_NBZQTY, //内包装件数
          F_QADV_FZLOT: barCodeData.F_QADV_FZLOT //分装批次号
        }
      ],
      detailList: {
        //编码，批号，名称，规格，可收，数量，仓位，件数
        fnumber: barCodeData.F_NUMBER.Number, //编码
        lot: barCodeData.F_WLLOT, //批号
        name: barCodeData.F_NUMBER.Name[0].Value, //名称
        specification: barCodeData.F_NUMBER.MultiLanguageText[0].Specification, //规格
        receivableQuantity: barCodeData.F_POQTY, //可收
        quantity: barCodeData.F_UNITQTY, //数量
        location: setData.locationNumber //仓位
      },
      //客户
      Customer: barCodeData.FCUSTID?.Number,
      //生产部门
      ProductionDepartment: barCodeData.F_ALMA_BM?.Number,
      //条码单编码
      BarCode: searchValue,
      //物料编码
      MaterialCode: barCodeData.F_NUMBER.Number,
      //源单单号
      SourceOrderNo: barCodeData.F_SourceFbillno,
      //源单行号
      SourceOrderLineNo: barCodeData.F_SourceEntry * 1,
      //源单行ID
      // SourceOrderLineId: resOrder.data[0][1],
      //需求来源
      SourceOrderType: barCodeData.F_QADV_XQLY,
      //需求单号
      SourceOrderNo2: barCodeData.F_YVRT_XQDJ,
      //需求行号
      SourceOrderLineNo2: barCodeData.F_YVRT_YDSeq,
      //合同号
      ContractNo: barCodeData.F_HTNO,
      //合同行号
      ContractLineNo: barCodeData.F_QADV_HTENTRYID,
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
      //仓位Id
      FStockLocId: setData.locationId,
      //部件单位用量
      UnitQty: barCodeData.F_JUNITQTY,
      //分装数量
      SplitValue: barCodeData.F_UNITQTY,
      //总箱数
      TotalBox: barCodeData.F_TOTALCARTONQTY,
      //批量
      F_POQTY: barCodeData.F_POQTY,
      Unit: barCodeData.F_NUMBER.MaterialBase[0].BaseUnitId.Name[0].Value,
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

    return data
  }
}

//采购入库-扫描单号
export const getcamelCase = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await getSalesReturn(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '销售退货单不存在',
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
    const TreeEntity = res.data.Result.Result.SAL_RETURNSTOCKENTRY
    for (const item of TreeEntity) {
      const stockLoc = item.StocklocId
      let actualValue = null

      // 获取对象的所有 key
      const FStockLocId = {} as any
      let FlexNumber = ''
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
            FlexNumber = key
            break
          }
        }
      }
      const data = {
        currentList: [
          {
            label: '部门',
            value: res.data.Result.Result.Sledeptid?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value:
              item.SrcBillNo + (item.F_QADV_YDENTRYID !== 0 ? '-' + item.F_QADV_YDENTRYID : ''),
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
            style: { width: '65%' }
          },
          {
            label: '单位',
            value: item.UnitId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          },
          {
            label: '合同',
            value: item.OrderNo + (item.F_QADV_POENTRYID !== 0 ? '-' + item.F_QADV_POENTRYID : ''),
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
            value: res.data.Result.Result.RetcustId?.Name?.[0]?.Value,
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
            label: '仓位',
            value: actualValue?.Number,
            disabled: false,
            type: 'select',
            style: { width: '100%' }
          }
        ],
        detailList: {
          //编码，批号，名称，规格，可收，数量，仓位，件数
          fnumber: item.MaterialId.Number, //编码
          lot: item.Lot_Text, //批号
          name: item.MaterialId?.Name[0].Value, //名称
          specification: item.MaterialId.MultiLanguageText[0].Specification, //规格
          receivableQuantity: item.RealQty, //可收
          quantity: item.RealQty, //数量
          location: actualValue?.Number, //仓位
          locationNumber: actualValue?.Number,
          FlexNumber: FlexNumber
        },
        barcodeList: [],
        receivableQuantity: item.RealQty, //可收
        entryId: item.Id,
        //客户
        Customer: res.data.Result.Result.RetcustId?.Number,
        //是否第一次扫描条码
        isLowerCamelCase: false,
        //是否整数
        isInteger: true,
        //物料编码
        MaterialCode: item.MaterialId.Number,
        //源单单号
        SourceOrderNo: item.SrcBillNo,
        //源单行号
        SourceOrderLineNo: item?.F_QADV_YDENTRYID,
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
        //仓位位置
        setFStockLocId: FStockLocId,

        //仓位
        WarehousePosition: actualValue?.Number,
        WarehousePositionName: actualValue?.Name[0].Value,
        WarehousePositionId: actualValue?.Id,
        //仓库
        WarehouseId: item.StockId?.Id,
        WarehouseNumber: item.StockId?.Number,
        WarehouseName: item.StockId?.Name[0].Value,
        //部件单位用量
        UnitQty: '',
        //可收货数量
        canReceive: item.RealQty,
        Unit: item.UnitId?.Name[0].Value,
        FZLOTList: [],
        packagingDataFZLOT: {}
      }
      dataList.push(data)
    }
  }

  return { dataList, fid }
}
