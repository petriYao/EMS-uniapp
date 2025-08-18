import { lookOutsourcing } from '@/api/modules/materialWithdrawal'
import { lowerCamelCase2, lowerCamelCase3 } from '@/api/modules/storage'

//委外领料
export const getOutsourcing = async (searchValue: any) => {
  let fid = 0
  const res = await lookOutsourcing(searchValue)
  console.log('条码单数据', res.data)

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
    console.log('生产领料属性', TreeEntity)

    const tempDataList = []

    for (const item of TreeEntity) {
      // 处理仓位逻辑...
      let actualValue = null
      const stockLoc = item.StockLocID
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
      } AND FStockId.Fnumber = '${item.StockID.Number}'`
      const FieldKeys = 'FBaseQty'
      const lowerRes: any = await lowerCamelCase2(FilterString, FieldKeys)
      if (lowerRes && lowerRes.data && lowerRes.data.length > 0) {
        for (const data of lowerRes.data) {
          inventory += data[0]
        }
      }

      // 查询储位
      let storageLocation = ''
      const FilterString2 = `F_QADV_WL='${item.MaterialId_Id}' AND F_QADV_WH = '${item.StockID_Id}' AND F_QADV_WHCW = '${actualValue?.Name[0].Value}' AND F_QADV_LOT = '${item.Lot_Text}'`
      const lowerRes2: any = await lowerCamelCase3(FilterString2, 'F_QADV_CW')
      if (lowerRes2 && lowerRes2.data && lowerRes2.data.length > 0) {
        storageLocation = lowerRes2.data[0][0]
      }

      // 构造数据对象
      const data = {
        currentList: [
          {
            label: '部门',
            value: res.data.Result.Result.SupplierId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: item.SubReqBillNo + '-' + item.SubReqEntrySeq,
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
            value: item.FUnitID?.Name[0].Value,
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
          quantity: 0
        },
        barcodeList: [],
        SrcBillNo: item.FSrcBillNo,
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
        Unit: item.FUnitID?.Name[0].Value,
        IsSplit: false,
        FZLOTList: [],
        packagingDataFZLOT: {} as any
      }

      tempDataList.push(data)
    }
    console.log('合并钱', tempDataList)
    // 合并相同项
    const keyMap = new Map()

    for (const item of tempDataList) {
      const key = `${item.SrcBillNo}-${item.SrcEntrySeq}-${item.Lot}`
      if (keyMap.has(key)) {
        const existing = keyMap.get(key)

        // 累加数值字段
        existing.canReceive += item.canReceive
        existing.detailList.receivableQuantity += item.detailList.receivableQuantity
        existing.detailList.inventory += item.detailList.inventory

        // 拼接字符串字段
        // 拼接 stockLocName

        const stockLocSet = new Set(
          (existing.detailList.stockLocName || '').split(',').filter((item: unknown) => item !== '')
        )
        stockLocSet.add(item.detailList.stockLocName)
        const stockLocNameArray = [...stockLocSet].filter((item: unknown) => item !== '')
        existing.detailList.stockLocName = stockLocNameArray.join(',')

        // 拼接 storageLocation
        const storageSet = new Set(
          (existing.detailList.storageLocation || '')
            .split(',')
            .filter((item: unknown) => item !== '')
        )
        storageSet.add(item.detailList.storageLocation)
        const storageLocationArray = [...storageSet].filter((item: unknown) => item !== '')
        existing.detailList.storageLocation = storageLocationArray.join(',')
        console.log('储位', existing.detailList.storageLocation)

        // 同步更新 currentList 中的值（可选）
        const stockLocField = existing.currentList.find((i) => i.label === '库存')
        if (stockLocField) {
          stockLocField.value = existing.detailList.inventory
        }

        const storageLocationField = existing.currentList.find((i) => i.label === '储位')
        if (storageLocationField) {
          storageLocationField.value =
            existing.detailList.storageLocation || existing.detailList.stockLocName
        }

        const receivableField = existing.currentList.find((i) => i.label === '可领')
        if (receivableField) {
          receivableField.value = existing.canReceive
        }
      } else {
        keyMap.set(key, { ...item })
      }
    }

    // 转为数组
    const mergedDataList = Array.from(keyMap.values())

    console.log('合并后的生产入库明细数据', mergedDataList)

    return { dataList: mergedDataList, fid }
  }
}
