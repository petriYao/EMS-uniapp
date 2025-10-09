import { lookSimple } from '@/api/modules/materialWithdrawal'
import { lowerCamelCase2, lowerCamelCase3 } from '@/api/modules/storage'

//简单生产领料-扫描单号
export const getSimple = async (searchValue: any) => {
  let fid = 0
  const res = await lookSimple(searchValue)
  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '简单生产领料单不存在',
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
            value: res.data.Result.Result.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value:
              (item.SrcBillNo || '') +
              (item.SrcBillNo && item.SrcEntrySeq ? '-' : '') +
              (item.SrcEntrySeq || ''),
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
            value: actualValue?.Name[0].Value,
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
        entryId: item.Id,
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
      const key = `${item.MaterialCode}-${item.Lot}`
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
        //existing.detailList.inventory = item.detailList.inventory

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
//简单生产领料-扫单领料
export const getSanSimple = async (searchValue: any) => {
  let fid = 0 // 存储单据ID
  // 调用生产领料单接口
  const res = await lookSimple(searchValue)

  // 判断接口返回数据有效性
  if (res && res.data) {
    // 处理异常情况
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '简单生产领料单不存在',
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
            value: res.data.Result.Result.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value:
              (item.SrcBillNo || '') +
              (item.SrcBillNo && item.SrcEntrySeq ? '-' : '') +
              (item.SrcEntrySeq || ''),
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
            label: '单位',
            value: item.UnitId?.Name[0].Value,
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
