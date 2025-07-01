import { viewApi, executeBillQueryApi, saveApi, subitApi, auditApi } from '@/api/commonHttp'

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
  console.log('调拨单保存', JSON.stringify(data.data.Model))
  return saveApi(data) as any
}
