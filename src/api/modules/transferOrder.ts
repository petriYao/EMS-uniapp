import { pushApi, saveApi, executeBillQueryApi, viewApi } from '@/api/commonHttp'

//采购订单单据查询
export function transferOrder(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `PUR_PurchaseOrder`,
        FieldKeys: 'FID,FPOOrderEntry_FEntryID',
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
//调拨单保存
export function saveProductionOrder(Model: any) {
  const data = {
    formid: 'STK_TransferDirect',
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
      Model: Model
    }
  }
  return saveApi(data) as any
}
//查看采购退料单
export function lookqueryStorage(Number: any) {
  const data = {
    FormId: `PUR_MRB`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//采购入库下推
export function pushClient(EntryIds: any, FEntry: any) {
  const data = {
    formid: 'PUR_PurchaseOrder',
    data: {
      Ids: '',
      Numbers: [],
      EntryIds: EntryIds,
      RuleId: 'QADV_CGDD_CGRKDCJ',
      TargetBillTypeId: '',
      TargetOrgId: 0,
      TargetFormId: 'STK_InStock',
      IsEnableDefaultRule: 'false',
      IsDraftWhenSaveFail: 'false',
      CustomParams: {
        FEntry
      }
    }
  }
  return pushApi(data) as any
}

//获取采购订单
export function getProductionOrder(Number: any) {
  const data = {
    FormId: `STK_InStock`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//采购订单保存
export function savePurchaseOrder(Model: any) {
  const data = {
    formid: 'STK_InStock',
    data: {
      IsDeleteEntry: 'true',
      IsAutoSubmitAndAudit: true,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//查看其他出库单
export function lookOtherOutbound(Number: any) {
  const data = {
    FormId: `STK_MisDelivery`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//查看销售退货单
export function lookSalesReturn(Number: any) {
  const data = {
    FormId: `SAL_RETURNSTOCK`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

//其他入库单保存
export function saveOtherInbound(Model: any) {
  const data = {
    formid: 'STK_MISCELLANEOUS',
    data: {
      IsAutoSubmitAndAudit: true,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//获取销售退货单
export function getSalesReturn(Number: any) {
  const data = {
    FormId: `SAL_RETURNSTOCK`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//销售退货单保存
export function saveSalesReturn(Model: any) {
  const data = {
    formid: 'SAL_RETURNSTOCK',
    data: {
      IsAutoSubmitAndAudit: true,
      Model: Model
    }
  }
  return saveApi(data) as any
}

//采购订单单据查询
export function queryPurchaseReturn(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `SAL_RETURNSTOCK`,
        FieldKeys: 'FID,FPOOrderEntry_FEntryID',
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

//盘点
export function getInventory(Number: any) {
  const data = {
    FormId: `QADV_PD`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}

export function saveInventory(Model: any) {
  const data = {
    formid: 'QADV_PD',
    data: {
      IsDeleteEntry: false,
      IsAutoSubmitAndAudit: false,
      Model: Model
    }
  }
  return saveApi(data) as any
}
