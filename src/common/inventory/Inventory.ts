import { getInventory } from '@/api/modules/transferOrder'

//盘点-扫描单号
export const getcamelCase = async (searchValue: any, scanCodeType: string) => {
  //searchValue的值为******-****，需要拆分
  const [number, entrySeq] = searchValue.split('-')
  const dataList = [] as any
  let fid = 0
  const res = await getInventory(number)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '盘点单不存在',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    if (res.data.Result?.Result?.DocumentStatus !== 'C') {
      uni.showToast({
        title: '盘点单未审核',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    if (res.data.Result?.Result?.F_QADV_CloseStatus === 'B') {
      uni.showToast({
        title: '盘点单已关闭',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    if (entrySeq > res.data.Result.Result.F_QADV_PDEntry.length) {
      uni.showToast({
        title: '无盘点表',
        icon: 'none'
      })
      return { dataList: [], fid: 0 }
    }
    fid = res.data.Result.Result.Id
    const TreeEntity = res.data.Result.Result.F_QADV_PDEntry
    const entry = TreeEntity[entrySeq - 1]

    // 判断，当盘点时，如果已有盘点人则提示
    if (
      (scanCodeType === '初盘' && entry.F_QADV_YG_Id !== 0) ||
      (scanCodeType === '复盘' && entry.F_QADV_YGFP_Id !== 0)
    ) {
      // 重复盘点的情况，需要用户确认
      return new Promise((resolve) => {
        uni.showModal({
          title: '重复盘点',
          content: '是否继续盘点？',
          success: (res) => {
            if (res.confirm) {
              const data = buildDataList(entry, searchValue, scanCodeType)
              dataList.push(data)
              resolve({ dataList, fid })
            } else if (res.cancel) {
              resolve({ dataList: [], fid: 0 })
            }
          }
        })
      })
    } else {
      // 正常情况，直接构建数据
      const data = buildDataList(entry, searchValue, scanCodeType)
      dataList.push(data)
    }
  }

  return { dataList, fid }
}

// 构建数据列表的辅助函数
function buildDataList(entry: any, searchValue: string, scanCodeType: string) {
  const stockLoc = entry.F_QADV_STOCKLOCID
  let actualValue = null

  // 获取对象的所有 key
  const FStockLocId = {} as any
  // 找到第一个 F10000x 字段，且其值不为 null
  if (stockLoc != null) {
    const keys = Object.keys(stockLoc)
    for (const key of keys) {
      if (key.startsWith('F10000') && stockLoc[key] !== null && typeof stockLoc[key] === 'object') {
        FStockLocId[`FSTOCKLOCID__F` + key] = {
          Fnumber: stockLoc[key].Number
        }
        actualValue = stockLoc[key]
        break
      }
    }
  }

  return {
    currentList: [
      {
        label: '卡号',
        value: searchValue,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '编码',
        value: entry.F_QADV_NUMBER.Number,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '名称',
        value: entry.F_QADV_NUMBER?.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '规格',
        value: entry.F_QADV_NUMBER.MultiLanguageText[0].Specification,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '批号',
        value:
          entry.F_QADV_FLOT && entry.F_QADV_FLOT.trim() !== ''
            ? entry.F_QADV_FLOT
            : entry.F_QADV_LOT_Text,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '合同',
        value: entry.F_QADV_HTNO + (entry.F_QADV_HTENTRY !== ' ' ? '-' + entry.F_QADV_HTENTRY : ''),
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },

      {
        label: '客户',
        value: entry.F_QADV_KH?.Name?.[0]?.Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },

      {
        label: '仓库',
        value: entry.F_QADV_STOCKID?.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '仓位',
        value: actualValue?.Number,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '储位',
        value: entry?.F_QADV_CW,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '单位',
        value: entry.F_QADV_NUMBER.MaterialStock[0].StoreUnitID?.Name[0].Value,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '账存',
        value: entry.F_QADV_QTY,
        disabled: true,
        type: 'input',
        style: { width: '100%' }
      },
      {
        label: '实盘',
        // value: scanCodeType === '初盘' ? entry.F_QADV_CPQTY : entry.F_QADV_FPQTY,
        value:
          scanCodeType === '初盘'
            ? entry.F_QADV_CPQTY === 0
              ? null
              : entry.F_QADV_CPQTY
            : entry.F_QADV_FPQTY === 0
            ? null
            : entry.F_QADV_FPQTY,
        disabled: false,
        type: 'number',
        style: { width: '100%' }
      }
    ],
    entity: entry.Id
  }
}
