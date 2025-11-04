import { lookBarCode, queryBarCode } from '@/api/modules/storage'
import { lookPickMtrl } from '@/api/modules/materialWithdrawal'
import { executeBillQueryApi, saveApi } from '@/api/commonHttp'
import { lowerCamelCase2, lowerCamelCase3 } from '@/api/modules/storage'

//生产领料-扫描单号
export const getcamelCase = async (searchValue: any) => {
  let fid = 0
  const res = await lookPickMtrl(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '生产领料单不存在',
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

    const tempDataList = []

    for (const item of TreeEntity) {
      // 处理仓位逻辑...
      let actualValue = null
      const stockLoc = item.StockLocId
      if (stockLoc != null) {
        const keys = Object.keys(stockLoc)
        for (const key of keys) {
          if (
            key.startsWith('F10000') &&
            stockLoc[key] !== null &&
            typeof stockLoc[key] === 'object'
          ) {
            actualValue = stockLoc[key]
            break
          }
        }
      }

      // 查询库存
      let inventory = 0
      const FilterString = `FMaterialId.Fnumber = '${item.MaterialId.Number}' ${
        item.Lot_Text == ' ' ? '' : "AND FLot.Fnumber = '" + item.Lot_Text + "'"
      } AND FStockId.Fnumber = '${item.StockId.Number}'`
      const FieldKeys = 'FBaseQty'
      const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
      if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
        for (const data of lowerRes.data) {
          inventory += data[0]
        }
      }

      // 查询储位
      let storageLocation = ''
      const FilterString2 = `F_QADV_WL='${item.MaterialId_Id}' AND F_QADV_WH = '${
        item.StockId_Id
      }'${
        actualValue ? ` AND F_QADV_WHCW = '${actualValue.Name[0].Value}'` : ''
      } AND F_QADV_LOT = '${item.Lot_Text}'`
      const lowerRes2: any = await lowerCamelCase3(FilterString2, 'F_QADV_CW')
      if (lowerRes2 && lowerRes2.data && lowerRes2.data.length > 0) {
        storageLocation = lowerRes2.data[0][0]
      }

      // 构造数据对象
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
            // value: item.MoBillNo + '-' + item.MoEntrySeq ,
            value: item.MoBillNo + (item.MoEntrySeq != 0 ? '-' + item.MoEntrySeq : ''),
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
            label: '储位',
            value: storageLocation,
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
            label: '库存',
            value: inventory,
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
            label: '可领',
            value: item.ActualQty,
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
          }
        ],
        detailList: {
          fnumber: item.MaterialId.Number,
          lot: item.Lot_Text,
          name: item.MaterialId?.Name[0].Value,
          specification: item.MaterialId.MultiLanguageText[0].Specification,
          stockLocName: actualValue?.Name[0].Value,
          storageLocation: storageLocation,
          inventory: inventory,
          receivableQuantity: item.ActualQty,
          stockNumber: item.StockId.Number, // 新增字段
          quantity: 0
        },
        barcodeList: [],
        SrcBillNo: item.SrcBillNo,
        SrcEntrySeq: item.SrcEntrySeq,
        canReceive: item.ActualQty,
        // 其他字段略...
        MaterialCode: item.MaterialId.Number,
        Lot: item.Lot_Text === ' ' ? '' : item.Lot_Text,
        Name: item.MaterialId?.Name[0].Value,
        Specification: item.MaterialId.MultiLanguageText[0].Specification,
        Quantity: 0,
        Quantity2: 0,
        //是否第一次扫描条码
        isLowerCamelCase: true,
        //是否整数
        isInteger: true,
        Unit: item.UnitId?.Name[0].Value,
        IsSplit: false,
        FZLOTList: [],
        packagingDataFZLOT: {} as any
      }

      tempDataList.push(data)
    }
    // 合并相同项
    const keyMap = new Map()

    for (const item of tempDataList) {
      const key = `${item.SrcBillNo}-${item.SrcEntrySeq}-${item.Lot}`
      const newItemStockNumber = item.detailList.stockNumber
      if (keyMap.has(key)) {
        const existing = keyMap.get(key)

        // 仅当 StockId 不同时才累加库存
        if (!existing.stockNumbers.has(newItemStockNumber)) {
          existing.detailList.inventory += item.detailList.inventory
          existing.stockNumbers.add(newItemStockNumber)
        }

        // 累加数值字段
        existing.canReceive += item.canReceive
        existing.detailList.receivableQuantity += item.detailList.receivableQuantity

        // 拼接字符串字段
        // 拼接 stockLocName
        const existingStockLocName = existing.detailList.stockLocName || ''
        const newStockLocName = item.detailList.stockLocName || ''
        const stockLocSet = new Set(existingStockLocName.split(','))
        if (newStockLocName) {
          stockLocSet.add(newStockLocName)
        }
        existing.detailList.stockLocName = [...stockLocSet].join(',')
        //如果最后一个是逗号就删除
        if (existing.detailList.stockLocName.endsWith(',')) {
          existing.detailList.stockLocName = existing.detailList.stockLocName.slice(0, -1)
        }
        // 拼接 storageLocation
        const existingStorageLocation = existing.detailList.storageLocation || ''
        const newStorageLocation = item.detailList.storageLocation || ''
        const storageSet = new Set(existingStorageLocation.split(','))
        if (newStorageLocation) {
          storageSet.add(newStorageLocation)
        }
        existing.detailList.storageLocation = [...storageSet].join(',')

        //如果最后一个是逗号就删除
        if (existing.detailList.storageLocation.endsWith(',')) {
          existing.detailList.storageLocation = existing.detailList.storageLocation.slice(0, -1)
        }

        // 同步更新 currentList 中的值（可选）

        const receivableField = existing.currentList.find((i: any) => i.label === '可领')
        if (receivableField) {
          receivableField.value = existing.canReceive
        }
      } else {
        keyMap.set(key, {
          ...item,
          stockNumbers: new Set([newItemStockNumber])
        })
      }
    }

    // 转为数组
    const mergedDataList = Array.from(keyMap.values())
    //处理储位
    for (const item of mergedDataList) {
      const stockLocField = item.currentList.find((i: any) => i.label === '储位')

      if (stockLocField) {
        stockLocField.value = item.detailList.storageLocation || item.detailList.stockLocName
      }

      const inventoryField = item.currentList.find((i: any) => i.label === '库存')
      if (inventoryField) {
        inventoryField.value = item.detailList.inventory
      }
    }
    return { dataList: mergedDataList, fid }
  }
}

// 生产领料-扫描条码
export const purchaseScanBarcode = async (searchValue: any) => {
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
      //源单单号
      SourceOrderNo: barCodeData.F_SourceFbillno,
      //源单行号
      SourceOrderLineNo: barCodeData.F_SourceEntry * 1,
      //需求来源
      SourceOrderType: barCodeData.F_QADV_XQLY,
      //需求单号
      SourceOrderNo2: barCodeData.F_YVRT_XQDJ,
      //需求行号
      SourceOrderLineNo2: barCodeData.F_YVRT_YDSeq,
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
    console.log('data', data)
    return data
  }
}

//生产领料单据查询
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
  return executeBillQueryApi(data)
}

//生产领料单-扫单领料
export const getSanDan = async (searchValue: any) => {
  let fid = 0 // 存储单据ID
  // 调用生产领料单接口
  const res = await lookPickMtrl(searchValue)

  // 判断接口返回数据有效性
  if (res && res.data) {
    // 处理异常情况
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '生产领料单不存在',
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
      // 查询库存信息
      let inventory = 0
      const FilterString = `FMaterialId.Fnumber = '${item.MaterialId.Number}' ${
        item.Lot_Text == ' ' ? '' : "AND FLot.Fnumber = '" + item.Lot_Text + "'"
      } AND FStockId.Fnumber = '${item.StockId.Number}'`
      const FieldKeys = 'FBaseQty'
      const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
      if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
        for (const data of lowerRes.data) {
          inventory += data[0]
        }
      }

      // 查询储位信息
      let storageLocation = ''
      const FilterString2 = `F_QADV_WL='${item.MaterialId_Id}' AND F_QADV_WH = '${
        item.StockId_Id
      }'${
        actualValue ? ` AND F_QADV_WHCW = '${actualValue.Name[0].Value}'` : ''
      } AND F_QADV_LOT = '${item.Lot_Text}'`
      const lowerRes2: any = await lowerCamelCase3(FilterString2, 'F_QADV_CW')
      if (lowerRes2 && lowerRes2.data && lowerRes2.data.length > 0) {
        storageLocation = lowerRes2.data[0][0]
      }

      // 构造完整数据对象
      const data = {
        currentList: [
          // 表单字段配置
          {
            label: '部门',
            value: res.data.Result.Result.F_QADV_SCCJ?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            // value: item.MoBillNo + '-' + item.MoEntrySeq,
            value: item.MoBillNo + (item.MoEntrySeq != 0 ? '-' + item.MoEntrySeq : ''),
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
            label: '库存',
            value: inventory,
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
            label: '储位',
            value: storageLocation,
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },
          {
            label: '可领',
            value: item.ActualQty,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          },
          {
            label: '仓库',
            value: item.StockId.Name[0].Value,
            disabled: false,
            type: 'select',
            style: { width: '100%' }
          },
          {
            label: '仓位',
            value: actualValue?.Name[0].Value,
            disabled: false,
            type: 'select',
            style: { width: '100%' }
          },
          {
            label: '数量',
            value: item.ActualQty,
            disabled: false,
            type: 'number',
            style: { width: '100%' }
          }
        ],
        detailList: {
          // 明细数据
          fnumber: item.MaterialId.Number,
          lot: item.Lot_Text,
          name: item.MaterialId?.Name[0].Value,
          specification: item.MaterialId.MultiLanguageText[0].Specification,
          stockLocName: actualValue?.Name[0].Value,
          storageLocation: storageLocation,
          inventory: inventory,
          receivableQuantity: item.ActualQty,
          quantity: item.ActualQty
        },
        EntityList: [], // 用于存储原始数据条目
        // 业务字段
        entryId: item.Id,
        seq: item.Seq,
        SrcBillNo: item.SrcBillNo,
        SrcEntrySeq: item.SrcEntrySeq,
        canReceive: item.ActualQty,
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
        Quantity2: item.ActualQty,
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
        existing.detailList.inventory = item.detailList.inventory

        // 合并字符串字段
        const existingStockLocName = existing.detailList.stockLocName || ''
        const newItemStockLocName = item.detailList.stockLocName || ''
        const stockLocSet = new Set(existingStockLocName.split(','))
        if (newItemStockLocName) {
          stockLocSet.add(newItemStockLocName)
        }
        existing.detailList.stockLocName = [...stockLocSet].join(',')
        if (existing.detailList.stockLocName.endsWith(',')) {
          existing.detailList.stockLocName = existing.detailList.stockLocName.slice(0, -1)
        }

        const existingStorageLocation = existing.detailList.storageLocation || ''
        const newItemStorageLocation = item.detailList.storageLocation || ''
        const storageSet = new Set(existingStorageLocation.split(','))
        if (newItemStorageLocation) {
          storageSet.add(newItemStorageLocation)
        }
        existing.detailList.storageLocation = [...storageSet].join(',')
        if (existing.detailList.storageLocation.endsWith(',')) {
          existing.detailList.storageLocation = existing.detailList.storageLocation.slice(0, -1)
        }

        // 同步更新表单字段

        const receivableField = existing.currentList.find((i: any) => i.label === '可领')
        if (receivableField) receivableField.value = existing.canReceive

        const sumField = existing.currentList.find((i: any) => i.label === '数量')
        if (sumField) sumField.value = existing.detailList.quantity

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
      const stockLocField = item.currentList.find((i: any) => i.label === '储位')

      if (stockLocField) {
        stockLocField.value = item.detailList.storageLocation || item.detailList.stockLocName
      }

      const inventoryField = item.currentList.find((i: any) => i.label === '库存')
      if (inventoryField) {
        inventoryField.value = item.detailList.inventory
      }
    }

    return { dataList: mergedDataList, fid }
  }
}
//生产领料单-扫描条码
export const scanBarCode = async (searchValue: any) => {
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
    if (barCodeData.F_BARTYPE === '1') {
      uni.showToast({
        title: '条码类型非通用',
        icon: 'none'
      })
      return null
    }
    const data = {
      //物料编码
      MaterialCode: barCodeData.F_NUMBER.Number,
      //批号
      Lot: barCodeData.F_WLLOT === ' ' ? '' : barCodeData.F_WLLOT,
      //名称
      Name: barCodeData.F_NUMBER.Name[0].Value,
      //当前条码数量
      CurrentQty: barCodeData.F_UNITQTY
    }

    return data
  }
}
//生产领料单保存
export function savePurchaseReturn(Model: any, IsAutoSubmitAndAudit = true) {
  const data = {
    formid: 'PUR_MRB',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: IsAutoSubmitAndAudit,
      Model: Model
    }
  }
  return saveApi(data) as any
}
