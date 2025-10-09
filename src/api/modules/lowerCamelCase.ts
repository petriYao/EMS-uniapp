import {
  viewApi,
  executeBillQueryApi,
  saveApi,
  subitApi,
  auditApi,
  unAuditApi,
  pushApi,
  deleteApi
} from '@/api/commonHttp'

//查看提货单
export function lookPickupOrder(Number: any) {
  const data = {
    FormId: `SAL_DELIVERYNOTICE`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data) as any
}
//提货单（单据查询）
export function pickupOrder(
  FilterString: string,
  FieldKeys = 'FBillNo,FEntity_FEntryID,F_QADV_FGQTY'
) {
  const data = {
    parameters: [
      {
        FormId: `SAL_DELIVERYNOTICE`,
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
//条码单据查询
export function queryBarCode(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `QADV_BARCODE`,
        FieldKeys: 'F_NUMBER.Fnumber,F_NUMBER.Fname,F_NUMBER.FSpecification',
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

//即时库存单据查询
export function queryInventory(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `STK_Inventory`,
        FieldKeys: 'FMaterialId.fnumber',
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
//物料单据查询
export function queryMaterial(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `BD_MATERIAL`,
        FieldKeys: 'FNumber,FName,FSpecification',
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
//查看条码
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
  return viewApi(data)
}
//保存条码
export function saveBarCode(Model: any) {
  const data = {
    formid: 'QADV_BARCODE',
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
      Model: Model
    }
  }
  return saveApi(data) as any
}
//销售出库单保存
export function saveSalesOrder(Model: any) {
  const data = {
    formid: 'SAL_OUTSTOCK',
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

//销售出库单单据查询
export function salesOrder(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `SAL_OUTSTOCK`,
        FieldKeys: 'FBillNo,FEntity_FEntryID,F_QADV_FZLOT,FEntity_Link_FSId', //单据ID,单据体ID,条码生成ID,源单分录内码
        FilterString: FilterString,
        OrderString: '',
        TopRowCount: 0,
        StartRow: 0,
        Limit: 2000,
        SubSystemId: ''
      }
    ]
  }
  return executeBillQueryApi(data) as any
}
//销售出库单查看
export function lookSalesOrder(Number: any) {
  const data = {
    FormId: `SAL_OUTSTOCK`,
    data: {
      CreateOrgId: 0,
      Number: Number,
      Id: '',
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data)
}
//销售出库单删除
export function deleteSalesOrder(Number: any) {
  const data = {
    FormId: `SAL_OUTSTOCK`,
    data: {
      Number: '',
      Ids: Number,
      IsDelete: true
    }
  }
  return deleteApi(data)
}
//分柜单删除
export function deleteSubContainer(Number: any) {
  const data = {
    FormId: `QADV_THDFG`,
    data: {
      Number: '',
      Ids: Number,
      IsDelete: true
    }
  }
  return deleteApi(data)
}
//提货单下推
export function pushClient(EntryIds: any, TargetFormId: string) {
  const data = {
    formid: 'SAL_DELIVERYNOTICE',
    data: {
      Ids: '',
      Numbers: [],
      EntryIds: EntryIds,
      RuleId: '',
      TargetBillTypeId: '',
      TargetOrgId: 0,
      TargetFormId: TargetFormId,
      IsEnableDefaultRule: 'true',
      IsDraftWhenSaveFail: 'true',
      CustomParams: {}
    }
  }
  return pushApi(data) as any
}
//出运分柜单据查询
export function shipmentSubContainer(FilterString: string) {
  const data = {
    parameters: [
      {
        FormId: `QADV_THDFG`,
        FieldKeys:
          'FID,FEntity_FEntryID,F_QADV_QTY,F_QADV_NUMBER.fnumber,F_QADV_SOURCEBILLNO,FOrderSeq,FEntity_FEntryID',
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
//出运分柜查看
export function lookShipmentSubContainer(Id: any) {
  const data = {
    FormId: `QADV_THDFG`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id: Id,
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data)
}
//出运分柜保存
export function shipmentSubContainerSave(Model: any, IsDeleteEntry = false) {
  const data = {
    formid: 'QADV_THDFG',
    data: {
      NeedUpDateFields: [],
      NeedReturnFields: [],
      IsDeleteEntry: IsDeleteEntry,
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

//通用反审核
export function UnAuditApiClient(formid: string, Numbers: any) {
  const data = {
    FormId: formid,
    data: {
      CreateOrgId: 0,
      Numbers: '',
      Ids: Numbers,
      InterationFlags: '',
      NetworkCtrl: '',
      IsVerifyProcInst: '',
      IgnoreInterationFlag: '',
      UseBatControlTimes: 'false'
    }
  }

  return unAuditApi(data)
}
