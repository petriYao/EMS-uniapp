import { pushApi, viewApi } from '@/api/commonHttp'

//销售订单(下推)
export function getPushCK(Numbers: any) {
  //FNumber 客户编码
  //FName 客户名称
  //FCOUNTRY 国家FDataValue
  //FSALDEPTID 销售部门
  //FSELLER 业务员
  //FDocumentStatus 禁用状态
  const data = {
    FormId: `SAL_SaleOrder`,
    data: {
      Ids: '',
      Numbers: Numbers, //销售订单单据编号
      EntryIds: '',
      RuleId: '',
      TargetBillTypeId: '',
      TargetOrgId: 0,
      TargetFormId: 'SAL_OUTSTOCK', //销售出库单标识
      IsEnableDefaultRule: 'true', //启用默认转换规则
      IsDraftWhenSaveFail: 'true', //暂存
      CustomParams: {}
    }
  }

  return pushApi(data)
}

//销售出库单详情
//查看客户
export function lookOutstock(id: any) {
  const data = {
    FormId: `SAL_OUTSTOCK`,
    data: {
      CreateOrgId: 0,
      Number: '',
      Id: id,
      IsSortBySeq: 'false'
    }
  }
  return viewApi(data)
}
