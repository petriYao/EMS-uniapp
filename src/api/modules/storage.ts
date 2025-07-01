import { viewApi, executeBillQueryApi, saveApi, subitApi, auditApi } from '@/api/commonHttp'

//查看条码单
export function lookBarCode(Number: any) {
  const data = {
    FormId: `QADV_BARCODE`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//条码单据查询
export function queryBarCode(F_QADV_FZLOT: string) {
  const data = {
    parameters: [
      {
        FormId: `QADV_BARCODE`,
        FieldKeys: 'F_FZNO',
        FilterString: `F_QADV_FZLOT='${F_QADV_FZLOT}'`,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  console.log('条码单数据', data)
  return executeBillQueryApi(data)
}

//查看生成条码单
export function lookCreateBarCode(Number: any) {
  const data = {
    FormId: `QADV_BAR`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//查看生产订单
export function lookProductionOrder(Number: any) {
  const data = {
    FormId: `PRD_MO`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//生产订单（单据查询）
export function productionOrder(
  FilterString: string,
  FieldKeys = 'FID,FBillNo,FTreeEntity_FSeq,FTreeEntity_FEntryId,FNoStockInQty,FWorkShopID.FNumber,FStockInQuaAuxQty'
) {
  const data = {
    parameters: [
      {
        FormId: `PRD_MO`,
        FieldKeys: FieldKeys, //单据ID,单据号,行号,行ID,未入库数量，车间
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
//条码单 （单据查询）
export function barcodeStatus(FilterString: string, FieldKeys = 'FNUMBER,F_NUMBER.FNumber') {
  const data = {
    parameters: [
      {
        FormId: `QADV_BARCODE`,
        FieldKeys: FieldKeys, //单据ID,单据号,行号,行ID,未入库数量，车间
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
//仓库单据查询接口
export function queryStorage() {
  const data = {
    parameters: [
      {
        FormId: `BD_STOCK`,
        FieldKeys: 'FName,FNumber',
        FilterString: "FDocumentStatus = 'C' AND FForbidStatus = 'A' ",
        OrderString: 'FNumber',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data)
}
//查看仓库单据
export function lookqueryStorage(Number: any) {
  const data = {
    FormId: `BD_STOCK`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//获取生产入库单
export function getProductionOrder(Number: any) {
  const data = {
    FormId: `PRD_INSTOCK`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//即时库存单据查询接口
export function lowerCamelCase2(FilterString: string, FieldKeys: string) {
  const data = {
    parameters: [
      {
        FormId: `STK_Inventory`,
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

//生产入库单保存
export function saveProductionOrder(FEntity: any, FID: any, SCCJ: string) {
  console.log('生产入库单保存')
  // 获取当前时间（本地时区）
  const now = new Date()

  // 手动补零函数
  const padZero = (num: number) => num.toString().padStart(2, '0')

  // 格式化输出
  const formattedDate = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(
    now.getDate()
  )} ${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`

  console.log(formattedDate) // 示例输出: "2024-04-25 14:30:45"

  const data = {
    formid: 'PRD_INSTOCK',
    data: {
      NeedUpDateFields: [],
      NeedReturnFields: [],
      IsDeleteEntry: 'true',
      SubSystemId: '',
      IsVerifyBaseDataField: 'false',
      IsEntryBatchFill: false,
      ValidateFlag: 'true',
      NumberSearch: 'true',
      IsAutoAdjustField: 'false',
      InterationFlags: '',
      IgnoreInterationFlag: '',
      IsControlPrecision: 'false',
      ValidateRepeatJson: 'false',
      IsAutoSubmitAndAudit: true,
      Model: {
        FID: FID,
        FBillType: {
          FNUMBER: 'SCRKD02_SYS'
        },
        FDate: formattedDate,
        FStockOrgId: {
          FNumber: '100'
        },
        FPrdOrgId: {
          FNumber: '100'
        },
        FOwnerTypeId0: 'BD_OwnerOrg',
        FOwnerId0: {
          FNumber: '100'
        },
        FIsEntrust: false,
        FCurrId: {
          FNumber: 'PRE001'
        },
        FEntrustInStockId: 0,
        F_QADV_SCCJ: {
          FNUMBER: SCCJ
        },
        FEntity: FEntity
      }
    }
  }
  console.log('生产入库单保存', JSON.stringify(data.data.Model))
  return saveApi(data) as any
}

//通用提交
export function SubmitClient(formid: string, Numbers: any) {
  const data = {
    formid: formid,
    data: {
      CreateOrgId: 0,
      Numbers: Numbers,
      Ids: '',
      SelectedPostId: 0,
      NetworkCtrl: '',
      IgnoreInterationFlag: ''
    }
  }

  return subitApi(data)
}
//通用审核
export function AuditApiClient(formid: string, Numbers: any) {
  const data = {
    FormId: formid,
    data: {
      CreateOrgId: 0,
      Numbers: Numbers,
      InterationFlags: '',
      NetworkCtrl: '',
      IsVerifyProcInst: '',
      IgnoreInterationFlag: '',
      UseBatControlTimes: 'false'
    }
  }

  return auditApi(data)
}
