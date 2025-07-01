import { lookBarCode, queryBarCode, productionOrder } from '@/api/modules/storage'

//调拨单-扫描条码
export const transferScanBarcode = async (searchValue: any, warehouseDataId: any) => {
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

    //源单类型非生产订单
    if (barCodeData.F_YVRT_YDLX !== '生产订单') {
      uni.showToast({
        title: '源单类型非生产订单',
        icon: 'none'
      })
      return null
    }

    //源单号，行号不能为空
    if (
      !barCodeData.F_SourceFbillno ||
      barCodeData.F_SourceFbillno === ' ' ||
      !barCodeData.F_SourceEntry ||
      barCodeData.F_SourceEntry === ' '
    ) {
      uni.showToast({
        title: '源单号，行号不能为空',
        icon: 'none'
      })
      return null
    }

    //仓库是否为相同
    // if (
    //   barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1].F_QADV_FSTOCKID
    //     .Number !== warehouseDataId
    // ) {
    //   uni.showToast({
    //     title: '仓库不一致',
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
    const stockLoc =
      barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1].F_QADV_STOCKLOCID
    console.log('stockLoc', stockLoc)
    let actualValue = null
    // 获取对象的所有 key
    const FStockLocId = {} as any
    // 找到第一个 F10000x 字段，且其值不为 null
    if (stockLoc != null) {
      const keys = Object.keys(stockLoc)

      for (const key of keys) {
        console.log('key', key)

        if (
          key.startsWith('F10000') &&
          stockLoc[key] !== null &&
          typeof stockLoc[key] === 'object'
        ) {
          FStockLocId[`FSrcStockLocId__F` + key] = {
            Fnumber: stockLoc[key].Number
          }
          actualValue = stockLoc[key]
          break
        }
      }
    }
    console.log('测试123', actualValue)
    const data = {
      currentList: [
        {
          label: '调出仓',
          value:
            barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1]
              .F_QADV_FSTOCKID.Name[0].Value,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '仓位',
          value: actualValue?.Name[0].Value,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '编码',
          value: barCodeData.F_NUMBER.Number,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '名称',
          value: barCodeData.F_NUMBER.Name[0].Value,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '规格',
          value: barCodeData.F_NUMBER.MultiLanguageText[0].Specification,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '批号',
          value: barCodeData.F_WLLOT,
          disabled: true,
          type: 'input',
          style: { width: '65%' }
        },
        {
          label: '批量',
          value: barCodeData.F_POQTY,
          disabled: true,
          type: 'input',
          style: { width: '35%' }
        },
        {
          label: '合同',
          value: barCodeData.F_HTNO + '-' + barCodeData.F_QADV_HTENTRYID,
          disabled: true,
          type: 'input',
          style: { width: '65%' }
        },
        {
          label: '总箱数',
          value: barCodeData.F_TOTALCARTONQTY,
          disabled: true,
          type: 'input',
          style: { width: '35%' }
        },

        {
          label: '客户',
          value: barCodeData.FCUSTID?.Name?.[0]?.Value,
          disabled: true,
          type: 'input',
          style: { width: '65%' }
        },

        {
          label: '单位',
          value: barCodeData.F_NUMBER.MaterialBase[0].BaseUnitId.Name[0].Value,
          disabled: true,
          type: 'input',
          style: { width: '35%' }
        }
      ],
      barCodeList: [
        {
          F_BARCODENO: barCodeData.Number,
          F_UNITQTY: barCodeData.F_UNITQTY, //每箱数量
          F_FZNO: barCodeData.F_FZNO, //分装编号
          F_BJNAME: barCodeData.F_BJNAME, //部件名称
          F_JUNITQTY: barCodeData.F_JUNITQTY, //部件用量
          F_QADV_NBZQTY: barCodeData.F_QADV_NBZQTY, //内包装件数
          F_QADV_FZLOT: barCodeData.F_QADV_FZLOT //分装批次号
        }
      ],
      otherData: {
        FMemo: barCodeData?.Description?.[0]?.Value, //备注
        F_QADV_KH: barCodeData.FCUSTID?.Number, //客户
        F_QADV_HTNO: barCodeData.F_HTNO, //合同
        F_QADV_HTENTRYID: barCodeData.F_QADV_HTENTRYID //合同行号
      },
      detailList: {
        //编码，批号，名称，规格，数量，件数，仓位
        fnumber: barCodeData.Number, //编码
        lot: barCodeData.F_WLLOT, //批号
        name: barCodeData.F_NUMBER.Name[0].Value, //名称
        specification: barCodeData.F_NUMBER.MultiLanguageText[0].Specification, //规格
        quantity: barCodeData.F_UNITQTY, //数量
        pieces: 1, //件数
        FStockLocId: FStockLocId, //仓位信息
        warehousePosition: actualValue?.Name[0].Value //仓位
      },
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
      //件数
      Quantity: barCodeData.F_CHECKBOXFZ ? 0 : barCodeData.F_UNITQTY,
      //数量
      Quantity2: barCodeData.F_CHECKBOXFZ ? 0 : barCodeData.F_UNITQTY,
      //当前条码数量
      CurrentQty: barCodeData.F_UNITQTY,
      //是否分装
      IsSplit: barCodeData.F_CHECKBOXFZ,
      //分装编号
      SplitCode: barCodeData.F_FZNO,
      //仓库
      WarehouseNumber:
        barCodeData.F_QADV_BARCODEENTRY[barCodeData.F_QADV_BARCODEENTRY.length - 1].F_QADV_FSTOCKID
          .Number,
      //部件单位用量
      UnitQty: barCodeData.F_JUNITQTY,
      //分装数量
      SplitValue: barCodeData.F_UNITQTY,
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
