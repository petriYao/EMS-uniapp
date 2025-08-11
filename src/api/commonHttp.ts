import http from '@/utils/requset'

//查询是否封账
export function QueryCheckoutTime(time: any) {
  const data = {
    parameters: [time]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.ClosePeriodWebApiService.QueryCheckoutTime,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//条码库存查询
export function QueryStock(Number: any) {
  const data = {
    parameters: [Number]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.StockItemCountWebApiService.QueryStock,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//条码列表查询
export function TMQuery(parameters: any) {
  const data = {
    parameters: parameters
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.StockItemCountWebApiService.TMQuery,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//条码状态查询
export function TMStatusQuery(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.StockItemCountWebApiService.TMStatusQuery,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//校验出运分柜单
export function CYFGQuery(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.StockItemCountWebApiService.CYFGQuery,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//修改条码
export function TMUpdate(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  console.log('修改条码', data)
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.ModifyBarcodeWebApiService.EditTM,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//修改条码（无仓库仓位）
export function EditCKTM(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  console.log('修改条码', data)
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.ModifyBarcodeWebApiService.EditCKTM,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//退料
export function CYCKQuery(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.ReturnMaterialWebApiService.PurchaseReturn,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//其他出库
export function OtherOutbound(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.ReturnMaterialWebApiService.OtherReturn,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//生产领料
export function MaterialRequisition(parameters: any) {
  const data = {
    parameters: [parameters]
  }
  return http({
    url: '/k3cloud/Kingdee.BOS.TM.WebApi.MaterialRequisitionWebApiService.MaterialRequisition,Kingdee.BOS.TM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//登录接口
export function login(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.AuthService.ValidateUser.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//保存接口
export function saveApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Save.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//提交接口
export function subitApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Submit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//审核接口
export function auditApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Audit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//反审核接口
export function unAuditApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.UnAudit.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//下推接口
export function pushApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Push.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查看接口
export function viewApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.View.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//表单数据查询接口
export function executeBillQueryApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.ExecuteBillQuery.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//删除接口
export function deleteApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.Delete.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//上传接口
export function attachmentUpLoadApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.AttachmentUpLoad.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//删除附件
export function attachmentDeleteApi(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.DeleteFilesWebApiService.DeleteFiles,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
//下载接口
export function attachmentDownLoadApi(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.AttachmentDownLoad.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查询报表
export function GetSysReportData(data: any) {
  return http({
    url: '/K3Cloud/Kingdee.BOS.WebApi.ServicesStub.DynamicFormService.GetSysReportData.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//查询套打列表
export function GetPrintModel(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.PrintModelWebApiService.PrintModel,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//套打导出pdf
export function GetPrintPDF(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.PrintExportWebApiService.DownloadPrintExportPDF,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}

//发送邮件
export function GetEmail(data: any) {
  return http({
    url: '/k3cloud/Kingdee.BOS.CRM.WebApi.SendAnEmailWebApiService.SendAnEmail,Kingdee.BOS.CRM.WebApi.common.kdsvc',
    method: 'POST',
    requestTime: 5000, //等待5秒
    data: data
  })
}
