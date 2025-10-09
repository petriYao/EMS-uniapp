import {
  lookBarCode,
  queryBarCode,
  getProductionOrder,
  productionOrder
} from '@/api/modules/storage'

/*单码双扫-根据单号获取数据*/
export const getInboundOrder = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await getProductionOrder(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '生产入库单不存在',
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
    for (const item of TreeEntity) {
      const packagingSig = [] as string[] //分装编号
      const packagingData: {
        [key: string]: { quantity: number; unitQty: number; finishedQty: number }
      } = {}
      //根据分装批次号找到 生成条码单的数据
      item.F_BARSubEntity.forEach((subItem: any) => {
        const { F_FZNO, F_QADV_Decimal_h1g, F_JUNITQTY } = subItem
        if (!packagingData[F_FZNO]) {
          packagingData[F_FZNO] = {
            quantity: F_QADV_Decimal_h1g,
            unitQty: F_JUNITQTY,
            finishedQty: F_QADV_Decimal_h1g / F_JUNITQTY
          }
          packagingSig.push(F_FZNO) // 添加分装编号
        } else {
          packagingData[F_FZNO].quantity += F_QADV_Decimal_h1g
          packagingData[F_FZNO].finishedQty =
            packagingData[F_FZNO].quantity / packagingData[F_FZNO].unitQty
        }
      })

      const stockLoc = item.StockLocId
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
        currentList: [
          {
            label: '部门',
            value: item.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: item.SrcBillNo + '-' + item.SrcEntrySeq,
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
            value: item.MaterialId.Name[0].Value,
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
            value: item.F_QADV_KH?.Name?.[0]?.Value,
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },
          {
            label: '总箱数',
            value: item.F_TOTALCARTONQTY,
            disabled: true,
            type: 'input',
            style: { width: '35%' }
          },
          {
            label: '推荐',
            value: '',
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },

          {
            label: '单位',
            value: item.BaseUnitId.Name[0].Value,
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
        barcodeList: item.F_BARSubEntity,
        otherData: {
          FMemo: item?.Description?.[0]?.Value, //备注
          F_QADV_KH: item.F_QADV_KH?.Number, //客户
          F_QADV_HTNO: item.F_QADV_HTNO, //合同
          F_QADV_HTENTRYID: item.F_QADV_HTENTRYID //合同行号
        },
        /*
        //条码单编码
        BarCode: searchValue,
        */
        //是否整数
        isInteger: false,
        //生产部门
        ProductionDepartment: item.WorkShopId?.Number,
        //物料编码
        MaterialCode: item.MaterialId.Number,
        //源单单号
        SourceOrderNo: item.SrcBillNo,
        //源单行号
        SourceOrderLineNo: item.SrcEntrySeq,
        //需求来源
        SourceOrderType: item.ReqSrc,
        //需求单号
        SourceOrderNo2: item.ReqBillNo,
        //需求行号
        SourceOrderLineNo2: item.ReqEntrySeq,
        //批号
        Lot: item.Lot_Text === ' ' ? '' : item.Lot_Text,
        //名称
        Name: item.MaterialId.Name[0].Value,
        //规格型号
        Specification: item.MaterialId.MultiLanguageText[0].Specification,
        //件数
        Quantity: item.F_BARSubEntity.length,
        //数量
        Quantity2: 0,
        //可收货数量
        canReceive: item.MustQty,
        //累计入库数量(合格品入库数量)
        //是否分装
        IsSplit: false,
        //分装编号
        SplitCode: '',
        //仓位
        WarehousePosition: actualValue?.Number,
        WarehousePositionName: actualValue?.Name[0].Value,
        WarehousePositionId: actualValue?.Id,
        //仓库
        WarehouseId: item.StockId?.Number,
        WarehouseName: item.StockId?.Name[0].Value,
        //部件单位用量
        UnitQty: '',
        //分装数量
        SplitValue: '',
        Unit: item.BaseUnitId.Name[0].Value,
        //分装批次号
        FZLOTList: [],
        packagingDataFZLOT: {} as any
        // packagiingData: packagingData,
        // packagngSig: packagingSig
      }
      dataList.push(data)
    }
  }
  return { dataList, fid }
}

//生产入库-扫描条码
export const productionGetData = async (
  searchValue: any,
  warehousePosition: any,
  scanCodeType: boolean
) => {
  const res = await lookBarCode(searchValue)
  if (res && res.data) {
    //生产订单-明细
    const barCodeData = res.data.Result.Result
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
    //条码类型为唯一
    if (barCodeData.F_BARTYPE === '2') {
      uni.showToast({
        title: '条码类型非唯一',
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

    //生产部门不可为空
    if (!barCodeData.F_ALMA_BM && !scanCodeType) {
      uni.showToast({
        title: '生产部门不可为空',
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
    if (barCodeData.F_BARSTATUS != 1) {
      uni.showToast({
        title: '条码非创建状态',
        icon: 'none'
      })
      return null
    }
    //查找最大可收货数量
    const res2: any = await productionOrder(
      `FBillNo = '${barCodeData.F_SourceFbillno}' AND FTreeEntity_FSeq = ${barCodeData.F_SourceEntry}`,
      `FBillNo,FNoStockInQty,FID,FTreeEntity_FEntryId,FWorkShopID.FNumber,FStockInQuaAuxQty` //单据编号,未入库数量,单据ID,行号ID,车间,累计入库
    )
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
      currentList: [
        {
          label: '部门',
          value: barCodeData.F_ALMA_BM?.Name[0].Value,
          disabled: true,
          type: 'input',
          style: { width: '100%' }
        },
        {
          label: '源单',
          value: barCodeData.F_SourceFbillno + '-' + barCodeData.F_SourceEntry,
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
          style: { width: '100%' }
        },

        {
          label: '合同',
          value:
            barCodeData.F_HTNO +
            (barCodeData.F_QADV_HTENTRYID !== ' ' ? '-' + barCodeData.F_QADV_HTENTRYID : ''),
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
          label: '客户',
          value: barCodeData.FCUSTID?.Name?.[0]?.Value,
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
          label: '推荐',
          // value: barCodeData.F_UNITQTY,
          value: '',
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
        },
        {
          label: '仓位',
          value: warehousePosition.number,
          disabled: false,
          type: 'select',
          style: { width: '100%' }
        }
        // {
        //   label: '本箱数',
        //   value: barCodeData.F_UNITQTY,
        //   disabled: true,
        //   type: 'text',
        //   style: { width: '50%' }
        // },
        // {
        //   label: '合计',
        //   value: 0,
        //   disabled: true,
        //   type: 'total',
        //   style: { width: '50%' }
        // },
      ],
      barcodeList: [
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
      Quantity: 1,
      //数量
      Quantity2: barCodeData.F_CHECKBOXFZ ? 0 : barCodeData.F_UNITQTY,
      //可收货数量
      canReceive: res2.data?.[0]?.[1],
      //行号ID
      FEntryId: res2.data?.[0]?.[3],
      //生产订单FID
      MOFID: res2.data?.[0]?.[2],
      //生产车间
      ProductionWorkshop: res2.data?.[0]?.[4],
      //累计入库数量
      TotalQty: res2.data?.[0]?.[5],
      //当前条码数量
      CurrentQty: barCodeData.F_UNITQTY,
      //是否分装
      IsSplit: barCodeData.F_CHECKBOXFZ,
      //分装编号
      SplitCode: barCodeData.F_FZNO,
      //仓位
      WarehousePosition: warehousePosition.number,
      WarehousePositionId: warehousePosition.id,
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

    return data
  }
}

/*扫单入库-扫描单号*/
export const getcamelCase = async (searchValue: any) => {
  const dataList = [] as any
  let fid = 0
  const res = await getProductionOrder(searchValue)

  if (res && res.data) {
    if (res.data.Result?.ResponseStatus?.IsSuccess === false) {
      uni.showToast({
        title: '生产入库单不存在',
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
    for (const item of TreeEntity) {
      const stockLoc = item.StockLocId
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
        currentList: [
          {
            label: '部门',
            value: item.WorkShopId?.Name[0].Value,
            disabled: true,
            type: 'input',
            style: { width: '100%' }
          },
          {
            label: '源单',
            value: item.SrcBillNo + '-' + item.SrcEntrySeq,
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
            value: item.MaterialId.Name[0].Value,
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
            value: item.F_QADV_KH?.Name?.[0]?.Value,
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
            value: '',
            disabled: true,
            type: 'input',
            style: { width: '65%' }
          },

          {
            label: '单位',
            value: item.BaseUnitId.Name[0].Value,
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
            value: item.RealQty,
            disabled: false,
            type: 'input',
            style: { width: '100%' }
          }
        ],
        FEntity_Link: [
          {
            FEntity_Link_FRuleId: item?.FEntity_Link?.[0]?.RuleId, //生产订单到生产入库单单据转换标识
            FEntity_Link_FSTableName: item?.FEntity_Link?.[0]?.STableName, //生产订单表体表名
            FEntity_Link_FSBillId: item?.FEntity_Link?.[0]?.SBillId, //生产订单内码
            FEntity_Link_FSId: item?.FEntity_Link?.[0]?.SId, //生产订单分录内码
            FEntity_Link_FFlowId: item?.FEntity_Link?.[0]?.FlowId, //业务流程
            FEntity_Link_FFlowLineId: item?.FEntity_Link?.[0]?.FlowLineId, //推进路线
            FEntity_Link_FBasePrdRealQtyOld: item?.FEntity_Link?.[0]?.BasePrdRealQtyOld, //原始携带量
            FEntity_Link_FBasePrdRealQty: item?.FEntity_Link?.[0]?.BasePrdRealQty //修改携带量
          }
        ],
        otherData: {
          FMemo: item?.Description?.[0]?.Value, //备注
          F_QADV_KH: item.F_QADV_KH?.Number, //客户
          F_QADV_HTNO: item.F_QADV_HTNO, //合同
          F_QADV_HTENTRYID: item.F_QADV_HTENTRYID //合同行号
        },
        /*
        //条码单编码
        BarCode: searchValue,
        */
        //是否第一次扫描条码
        isLowerCamelCase: false,
        //是否整数
        isInteger: true,
        //生产部门
        ProductionDepartment: item.WorkShopId?.Number,
        //物料编码
        MaterialCode: item.MaterialId.Number,
        //源单单号
        SourceOrderNo: item.SrcBillNo,
        //源单行号
        SourceOrderLineNo: item.SrcEntrySeq,
        //批号
        Lot: item.Lot_Text === ' ' ? '' : item.Lot_Text,
        //名称
        Name: item.MaterialId.Name[0].Value,
        //规格型号
        Specification: item.MaterialId.MultiLanguageText[0].Specification,
        //件数
        Quantity: item.F_BARSubEntity.length,
        //数量
        Quantity2: item.RealQty,
        //仓位
        WarehousePosition: actualValue?.Number,
        WarehousePositionName: actualValue?.Name[0].Value,
        WarehousePositionId: '',
        //仓库
        WarehouseId: item.StockId?.Number,
        WarehouseName: item.StockId?.Name[0].Value,
        //部件单位用量
        UnitQty: '',
        //可收货数量
        canReceive: item.MustQty,
        Unit: item.BaseUnitId.Name[0].Value
      }
      dataList.push(data)
    }
  }
  return { dataList, fid }
}

/*扫单入库-扫描条码 */
export const camelCaseProduction = async (searchValue: any, warehousePosition: any) => {
  const res = await lookBarCode(searchValue)
  if (res && res.data) {
    //生产订单-明细
    const barCodeData = res.data.Result.Result
    if (barCodeData == null) {
      uni.showToast({
        title: '条码单不存在',
        icon: 'none'
      })
      return null
    }
    //条码类型为唯一
    if (barCodeData.F_BARTYPE === '1') {
      uni.showToast({
        title: '条码类型非通用类型',
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
    const data = {
      currentList: [],
      otherData: {
        FMemo: barCodeData?.Description?.[0]?.Value, //备注
        F_QADV_KH: barCodeData.FCUSTID?.Number, //客户
        F_QADV_HTNO: barCodeData.F_HTNO, //合同
        F_QADV_HTENTRYID: barCodeData.F_QADV_HTENTRYID //合同行号
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
      SourceOrderType: barCodeData.ReqSrc,
      //需求单号
      SourceOrderNo2: barCodeData.ReqBillNo,
      //需求行号
      SourceOrderLineNo2: barCodeData.ReqEntrySeq,
      //批号
      Lot: barCodeData.F_WLLOT === ' ' ? '' : barCodeData.F_WLLOT,
      //名称
      Name: barCodeData.F_NUMBER.Name[0].Value,
      //规格型号
      Specification: barCodeData.F_NUMBER.MultiLanguageText[0].Specification,
      //数量
      Quantity2: barCodeData.F_UNITQTY,
      //仓位
      WarehousePosition: warehousePosition,
      WarehousePositionId: '',
      //部件单位用量
      UnitQty: barCodeData.F_JUNITQTY,
      Unit: barCodeData.F_NUMBER.MaterialBase[0].BaseUnitId.Name[0].Value
    }
    return data
  }
}
