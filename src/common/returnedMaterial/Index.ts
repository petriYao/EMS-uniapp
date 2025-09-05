import { lookBarCode, queryBarCode } from '@/api/modules/storage'
import { lookReturn } from '@/api/modules/materialWithdrawal'
import { getStockLoc } from '@/common/comModel/Index'

//生产退料-扫描单号
export const getcamelCase = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await lookReturn(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '生产退料单不存在',
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
    const TreeEntity = res.data.Result.Result.Entity
    console.log('生产退料属性', TreeEntity)
    for (const item of TreeEntity) {
      const stockLoc = item.StockLocId
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
      //推荐
      const TJStockId = await getStockLoc(
        item.MaterialId.Number,
        item.Lot_Text,
        FlexNumber,
        item.StockId?.Number
      )

      const data = {
        currentList: [
          {
            label: '部门',
            value: res.data.Result.Result.F_QADV_SCCJ?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: item.MoBillNo + (item.MoEntrySeq !== 0 ? '-' + item.MoEntrySeq : ''),
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
            value: '',
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
            value: null,
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
            label: '推荐',
            value: TJStockId,
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
          receivableQuantity: item.Qty, //可收
          quantity: item.RealQty, //数量
          location: actualValue?.Number, //仓位
          locationNumber: actualValue?.Number,
          FlexNumber: FlexNumber
        },
        TJStockId: TJStockId,
        barcodeList: [],
        receivableQuantity: item.Qty, //可收
        entryId: item.Id,
        //是否第一次扫描条码
        isLowerCamelCase: false,
        //是否整数
        isInteger: true,
        //物料编码
        MaterialCode: item.MaterialId.Number,
        //源单单号
        SourceOrderNo: item.SrcBillNo,
        //源单行号
        SourceOrderLineNo: item?.SrcEntrySeq,
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
        FStockLocId: actualValue?.Id,
        //仓库
        WarehouseId: item.StockId?.Id,
        WarehouseNumber: item.StockId?.Number,
        WarehouseName: item.StockId?.Name[0].Value,
        //部件单位用量
        UnitQty: '',
        //可退数量
        canReceive: item.Qty,
        Unit: item.UnitID?.Name[0].Value,
        FZLOTList: [],
        packagingDataFZLOT: {}
      }
      dataList.push(data)
    }
    // 数据合并逻辑
    const keyMap = new Map()

    for (const item of dataList) {
      // 新的合并条件：stockName, stockLocName, MaterialCode, Lot
      const key = `${item.SourceOrderNo}-${item.SourceOrderLineNo}- ${item.WarehouseName}-${item.WarehousePosition}-${item.MaterialCode}-${item.Lot}`
      console.log('key', key)
      if (keyMap.has(key)) {
        const existing = keyMap.get(key)

        // 累加数值字段
        //existing.canReceive += item.canReceive
        existing.detailList.quantity += item.detailList.quantity
        existing.Quantity2 += item.Quantity2
        existing.detailList.receivableQuantity += item.detailList.receivableQuantity
        existing.receivableQuantity = existing.detailList.receivableQuantity

        // 将当前条目添加到EntityList
        existing.EntityList.push(item)
      } else {
        // 初始化新条目，EntityList包含自身
        keyMap.set(key, { ...item, EntityList: [item] })
      }
    }

    // 转换为数组并返回结果
    const mergedDataList = Array.from(keyMap.values())

    console.log('合并后的生产入库明细数据', mergedDataList)

    return { dataList: mergedDataList, fid }
  }
  console.log('生产入库明细数据', dataList)

  return { dataList, fid }
}

//条码扫描
export const purchaseScanBarcode = async (searchValue: any, setData: any) => {
  console.log('条码仓位', setData)
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
    if (barCodeData.F_BARSTATUS != '1' && barCodeData.F_BARSTATUS != '3') {
      uni.showToast({
        title: '条码非创建/出库状态',
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

      console.log('分装数量', barCodeData.F_UNITQTY)
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
    console.log('扫描条码2222', data)

    return data
  }
}
