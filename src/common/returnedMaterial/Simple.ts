import { lookSimpleReturn } from '@/api/modules/materialWithdrawal'
import { getStockLoc } from '@/common/comModel/Index'

//简单生产退料-单码双扫
export const getSimple = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await lookSimpleReturn(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '简单生产退料单不存在',
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
    console.log('简单生产退料属性', TreeEntity)
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
            value: res.data.Result.Result.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: '',
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
          quantity: 0, //数量
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
        SourceOrderNo: '',
        //源单行号
        SourceOrderLineNo: '',
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
  }
  console.log('生产入库明细数据', dataList)

  return { dataList, fid }
}

//简单生产退料-扫单退料
export const getSanSimple = async (searchValue: any) => {
  let fid = 0 // 存储单据ID
  // 调用生产领料单接口
  const res = await lookSimpleReturn(searchValue)
  console.log('条码单数据', res.data)

  // 判断接口返回数据有效性
  if (res && res.data) {
    // 处理异常情况
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '简单生产退料单不存在',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    // 判断单据是否已审核
    if (res.data.Result?.Result?.DocumentStatus === 'C') {
      uni.showToast({
        title: '单据已审核',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }

    // 提取基础数据
    fid = res.data.Result.Result.Id
    const TreeEntity = res.data.Result.Result.Entity
    console.log('生产领料属性123', TreeEntity)

    // 处理原始数据
    const tempDataList = []
    for (const item of TreeEntity) {
      // 处理仓位逻辑
      let actualValue = null
      let FlexNumber = ''
      const stockLoc = item.StockLocId
      if (stockLoc != null) {
        const keys = Object.keys(stockLoc)
        for (const key of keys) {
          // 查找以F10000开头的仓位字段
          if (
            key.startsWith('F10000') &&
            stockLoc[key] !== null &&
            typeof stockLoc[key] === 'object'
          ) {
            actualValue = stockLoc[key]
            FlexNumber = key
            break
          }
        }
      }
      const TJStockId = await getStockLoc(
        item.MaterialId.Number,
        item.Lot_Text,
        FlexNumber,
        item.StockId?.Number
      )

      // 构造完整数据对象
      const data = {
        currentList: [
          {
            label: '部门',
            value: res.data.Result.Result.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: '',
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
          },
          {
            label: '数量',
            value: 0,
            disabled: false,
            type: 'number',
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
          quantity: 0, //数量
          location: actualValue?.Number, //仓位
          stockLocName: actualValue?.Name[0].Value, // 仓位名称
          locationNumber: actualValue?.Number,
          FlexNumber: FlexNumber
        },
        EntityList: [], // 用于存储原始数据条目
        // 业务字段
        entryId: item.Id,
        seq: item.Seq,
        SrcBillNo: item.SrcBillNo,
        SrcEntrySeq: item.SrcEntrySeq,
        canReceive: item.Qty,
        FlexNumber: FlexNumber,
        stockName: item.StockId.Name[0].Value, // 仓库名称
        stockNumber: item.StockId.Number, // 仓库编码
        stockLocName: actualValue?.Name[0].Value, // 仓位名称
        stockLocNumber: actualValue?.Number, // 仓位编码
        MaterialCode: item.MaterialId.Number,
        Lot: item.Lot_Text === ' ' ? '' : item.Lot_Text,
        Name: item.MaterialId?.Name[0].Value,
        Specification: item.MaterialId.MultiLanguageText[0].Specification,
        Quantity: 0,
        Quantity2: item.Qty,
        isLowerCamelCase: false, // 是否第一次扫描条码
        isInteger: true, // 是否整数
        Unit: item.UnitId?.Name[0].Value,
        IsSplit: false,
        FZLOTList: [],
        packagingDataFZLOT: {} as any
      }

      tempDataList.push(data)
    }

    // 数据合并逻辑
    const keyMap = new Map()

    for (const item of tempDataList) {
      // 新的合并条件：stockName, stockLocName, MaterialCode, Lot
      const key = `${item.stockName}-${item.stockLocName}-${item.MaterialCode}-${item.Lot}`

      if (keyMap.has(key)) {
        const existing = keyMap.get(key)

        // 累加数值字段
        existing.canReceive += item.canReceive
        existing.detailList.quantity += item.detailList.quantity
        existing.Quantity2 += item.Quantity2
        existing.detailList.receivableQuantity += item.detailList.receivableQuantity

        // 将当前条目添加到EntityList
        existing.EntityList.push(item)
      } else {
        // 初始化新条目，EntityList包含自身
        keyMap.set(key, { ...item, EntityList: [item] })
      }
    }

    // 转换为数组并返回结果
    const mergedDataList = Array.from(keyMap.values())
    for (const item of mergedDataList) {
      const inventoryField = item.currentList.find((i: any) => i.label === '数量')
      if (inventoryField) {
        inventoryField.value = item.detailList.receivableQuantity
      }
    }
    console.log('合并后的生产入库明细数据', mergedDataList)

    return { dataList: mergedDataList, fid }
  }
}
