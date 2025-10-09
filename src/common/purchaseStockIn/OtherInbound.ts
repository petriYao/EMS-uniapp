import { lookBarCode, queryBarCode } from '@/api/modules/storage'
// 其他入库-扫描条码
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
    if (barCodeData.F_YVRT_YDLX == '生产订单' || barCodeData.F_YVRT_YDLX == '采购订单') {
      uni.showToast({
        title: '源单类型不符',
        icon: 'none'
      })
      return null
    }

    //部门不可为空
    if (barCodeData.F_ALMA_BM_Id == 0) {
      uni.showToast({
        title: '生产部门不可为空',
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
            barCodeData.F_QADV_HTENTRYID == 0
              ? barCodeData.F_HTNO
              : barCodeData.F_HTNO + '-' + barCodeData.F_QADV_HTENTRYID,
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
          value: setData.locationNumber,
          disabled: true,
          type: 'select',
          style: { width: '100%' }
        }
      ],
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
      otherData: {
        FMemo: barCodeData?.Description?.[0]?.Value, //备注
        F_QADV_KH: barCodeData.FCUSTID?.Number, //客户
        F_QADV_HTNO: barCodeData.F_HTNO, //合同
        F_QADV_HTENTRYID: barCodeData.F_QADV_HTENTRYID //合同行号
      },
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
      receivableQuantity: barCodeData.F_POQTY, //可收
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
      //合同号
      ContractNumber: barCodeData.F_HTNO,
      //合同行号
      ContractLine: barCodeData.F_QADV_HTENTRYID,
      //客户
      Customer: barCodeData.FCUSTID?.Number,
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
      //仓位编码
      locationNumber: setData.locationNumber,
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
